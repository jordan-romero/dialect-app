# Cohorts and teacher dashboard: plan

Status: **built (Nov 8)** on `claude/cohorts-teacher-dashboard-0ed462`, after
Jordan's feedback: no scoring, QR codes, pricing set (Stripe test mode),
role-based access, open questions 2–5 answered. Invite emails are out of scope
here (copyable links + code + QR for now); see the email PR for sending.

## What we're building

A teacher creates a **cohort** (one class), invites students by email or a
join link, and picks how the class pays:

- **Self-pay**: each student buys the course through the existing Stripe
  checkout, then appears in the cohort.
- **Seat package**: the teacher or university buys N seats in one Stripe
  purchase. Students who join use a seat and get access without paying.

Teachers get a dashboard with a roster per cohort and a per-student drill-down
showing exactly what the student typed into each exercise, next to the
correct answer.

## What I found in the code that shapes this

- `UserAnswer` holds one row per (user, quiz, question). `textAnswer` has a
  different format per exercise: an option id (`MultipleChoice`,
  `LineBuilder`), a JSON map `{optionId: text}` (`ShortAnswer`), JSON for the
  board/chart exercises (`DragAndDrop`, `VowelQuadrilateral`, `LexicalChart`,
  `ConsonantRectangle`, `StressPlacement`, `Symbol`, `HangmanIPA`), or the
  literal `"completed"` (`RepeatAfterMe`, `Corrections`, `BuildDiphthongs`).
- `LessonProgress.quizScore` and `quizPassed` exist but **nothing reads or
  writes them**. Decision: **no scoring**. Both columns are dropped in this
  branch; the dashboard shows answers next to the correct answer with no
  scores. (`Quiz.score` / `passScore` are also unused but live in
  `seed-data.json`; left for a later cleanup.)
- "Last active" isn't stored. `LessonProgress.updatedAt` and
  `UserAnswer.updatedAt` give a good proxy (latest of the two).
- Paid access is a single boolean, `User.hasAccessToPaidCourses`, looked up
  **by email**. Seats need a second source of access, so this is the right
  moment to fix the lookup.
- The `bio`, `interests` and `badges` columns are in the schema but have no
  migration. The first migration in this branch will add them (with
  `IF NOT EXISTS`, since the dev DB may already have them from `db push`).

## Data model (Prisma)

```prisma
enum Role { STUDENT TEACHER ADMIN }

model User {
  // existing fields…
  role          Role              @default(STUDENT)
  teaching      Cohort[]          @relation("CohortTeacher")
  memberships   CohortMember[]
  purchases     Purchase[]
}

model Cohort {
  id           Int            @id @default(autoincrement())
  name         String         // "THTR 210, Spring 2027"
  institution  String?
  teacherId    Int
  teacher      User           @relation("CohortTeacher", fields: [teacherId], references: [id])
  paymentMode  CohortPayment  // SELF_PAY | SEATS
  seatCount    Int            @default(0)   // seats bought (sum of paid seat purchases)
  joinCode     String         @unique       // short, e.g. "K7F-3QX"; rotatable
  joinEnabled  Boolean        @default(true)
  startsAt     DateTime?
  endsAt       DateTime?      // optional; see open question on seat expiry
  archivedAt   DateTime?
  createdAt    DateTime       @default(now())
  members      CohortMember[]
  invites      CohortInvite[]
  purchases    Purchase[]
}

enum CohortPayment { SELF_PAY SEATS }

model CohortMember {
  id         Int      @id @default(autoincrement())
  cohortId   Int
  userId     Int
  joinedAt   DateTime @default(now())
  usesSeat   Boolean  @default(false)   // true = access comes from the cohort's seats
  removedAt  DateTime?                  // soft remove; frees the seat
  cohort     Cohort   @relation(fields: [cohortId], references: [id])
  user       User     @relation(fields: [userId], references: [id])
  @@unique([cohortId, userId])
}

model CohortInvite {
  id         Int       @id @default(autoincrement())
  cohortId   Int
  email      String    // lower-cased
  token      String    @unique  // random, used in the emailed link
  createdAt  DateTime  @default(now())
  acceptedAt DateTime?
  acceptedBy Int?
  cohort     Cohort    @relation(fields: [cohortId], references: [id])
  @@unique([cohortId, email])
}

model Purchase {
  id                Int       @id @default(autoincrement())
  userId            Int                 // buyer
  cohortId          Int?                // set for seat packages
  kind              PurchaseKind        // COURSE | SEATS
  quantity          Int       @default(1)
  amountTotal       Int                 // cents
  currency          String
  stripeSessionId   String    @unique   // idempotency key for the webhook
  stripePaymentIntent String? @unique
  status            PurchaseStatus      // PAID | REFUNDED | DISPUTED
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}
```

Access becomes: **a user has paid access if `hasAccessToPaidCourses` is true
(self-purchase, kept as-is) OR they're an active seat-holding member of a
cohort whose seats are still valid.** One function, `hasPaidAccess`, changes;
every caller already goes through it.

## Invite flow

1. Teacher creates a cohort at `/teach/cohorts/new` (name, institution,
   payment mode, optional end date).
2. Two ways in:
   - **Join link/code**: `/join/K7F-3QX`. Anyone signed in can use it while
     `joinEnabled` is on. Good for a classroom projector.
   - **QR code** of the join link, on the cohort page and on a print page
     (`/teach/cohorts/[id]/print`): big QR, class name, teacher, the join
     code typed out, two-line instructions, laid out for US Letter. Download
     as PNG/SVG too. Generated in the browser with the `qrcode` npm package
     (no service). Rotating the join code invalidates old QR codes.
   - **Email invites**: teacher pastes a list of emails. Each gets a
     `CohortInvite` with a token link `/join/invite/<token>`. The invite only
     works for a signed-in user whose **verified** Auth0 email matches.
3. On `/join/...` a signed-out visitor goes to Auth0 sign-up/login, then back.
4. On accept:
   - **SEATS cohort**: if a seat is free, create `CohortMember(usesSeat=true)`
     inside a transaction that re-counts used seats (so two students can't
     take the last seat). If full, show "your class is full, ask your
     teacher" and don't join.
   - **SELF_PAY cohort**: create `CohortMember(usesSeat=false)`. If they
     haven't bought the course, the join page sends them to the existing
     checkout (with `cohortId` in metadata, purely for reporting).
5. Students who already bought the course and join a SEATS cohort **don't
   use a seat** (they already have access).

**Sending email**: the app sends no email today. `info@actingaccents.com` is
a Namecheap Private Email mailbox (MX `mx1/mx2.privateemail.com`); the only
email code is the Mailchimp newsletter signup. v1: teachers copy invite
links ("copy all"), or hand out the join code / QR. Real invite emails could
go through Private Email's SMTP from info@ (no new vendor; needs the mailbox
password in Doppler, low sending limits) or Resend (new vendor, DNS records).

## Payment flows (Stripe, test mode)

**Pricing (created in Stripe test mode, Nov 8; placeholders until Scott and
Krista confirm for live).**

- **Individual course**: list **$360** (price lookup key `course_full`), with
  a **20% launch coupon** `LAUNCH20` applied automatically at checkout, so
  buyers see $360 → **$288**. (20% off $360 is $288; if you want exactly
  $300, that's a $60-off coupon instead, a one-line swap.) The old $150 test
  price stays until the new one is wired in.
- **Class seats**: priced like a textbook. Product `prod_VaoioAXAVqEflw`
  "Acting Accents: class seat", volume pricing (every seat in the order gets
  the tier price):

| Seats in the order | Per seat | Example |
| --- | --- | --- |
| 1–24 | $150 | 20 seats = $3,000 |
| 25–49 | $135 | 30 seats = $4,050 |
| 50+ | $120 | 60 seats = $7,200 |

Stripe can't tier one-time prices, so each tier is its own price with a
lookup key (`seat_tier_1`, `seat_tier_25`, `seat_tier_50`), and the server
picks one from the quantity. Prices are looked up by key, so no new env
vars and `STRIPE_PRICE_ID` can retire. The tier is based on each order
alone; top-ups are priced on their own quantity.

**(a) Self-pay**: unchanged checkout. Adds `metadata.auth0Id` (and
`cohortId` if from a join page). Webhook grants access by `auth0Id`, falling
back to email only for sessions created before this deploys.

**(b) Seat package**: `POST /api/teach/cohorts/:id/checkout` with `quantity`
(teacher must own the cohort). Creates a Checkout Session with
`line_items: [{ price: STRIPE_SEAT_PRICE_ID, quantity, adjustable_quantity }]`
and `metadata: { kind: 'seats', cohortId, auth0Id }`. Buying more later just
adds seats. An invoice/PO path (universities often pay by invoice) can use
Stripe Invoicing later; out of scope here.

**Webhook changes** (`pages/api/stripe/webhook.ts`):
- `checkout.session.completed` and `checkout.session.async_payment_succeeded`:
  only act when `payment_status === 'paid'`. Upsert a `Purchase` keyed on
  `stripeSessionId` (so Stripe retries are idempotent). COURSE → set
  `hasAccessToPaidCourses` on the user found by `auth0Id`. SEATS → increment
  `Cohort.seatCount` by `quantity`.
- `charge.refunded` (full refund) → mark the `Purchase` REFUNDED; for COURSE,
  revoke `hasAccessToPaidCourses`; for SEATS, reduce `seatCount`. If that
  leaves more students than seats, nobody is kicked automatically; the
  dashboard shows "over by N" and the teacher decides who to remove.
- `charge.dispute.created` → mark DISPUTED and log it. I'd not revoke access
  automatically on a dispute; your call.
- You'd need to add those event types to the webhook endpoint in the Stripe
  dashboard (test mode).

## Role-based access

Roles live on `User.role`: **STUDENT** (default), **TEACHER**, **ADMIN**.
Permissions are defined once in `lib/rbac.ts`, never as ad-hoc role checks:

| Permission | Student | Teacher | Admin |
| --- | --- | --- | --- |
| Take the course (paid parts need purchase or seat) | ✓ | ✓ free | ✓ free |
| Join / leave a cohort | ✓ | ✓ | ✓ |
| Create cohorts, invite, buy seats | | own | all |
| View roster and student answers | | own cohorts | all |
| Remove students, rotate join code | | own cohorts | all |
| Assign roles | | | ✓ |

- `can(user, permission)` answers the role question; resource checks
  (`ownsCohort`, `isMemberOf`) answer "which ones". Every `/api/teach/*`
  route goes through one wrapper, `withPermission('cohort:view', handler)`,
  that resolves the user by Auth0 `sub`, checks role, then resource. The
  `/teach` pages do the same check server-side so they never render for the
  wrong role.
- Role is read from the database on each request, so changes apply at once.
- `ADMIN_EMAILS` keeps only its current job (test-card hints).
- Assigning roles: admin-only API plus `yarn set-role <email> <ROLE>`.
  Self-serve teacher sign-up with approval can come later.
- An **institution admin** (a department head seeing every teacher's cohorts
  at one university) fits as a fourth role plus an `Institution` table.
  Not in v1 unless you want it.
- One helper, `lib/teach.ts`, used by every teacher API route:
  - `requireTeacher(req, res)` → resolves the user **by Auth0 `sub`**, checks
    role is TEACHER or ADMIN.
  - `requireCohortOwner(user, cohortId)` → the cohort's `teacherId` is the
    user (ADMIN sees all).
  - `requireStudentInCohort(cohortId, studentId)` → the student is a member.
- A teacher can only ever read data for students who are members of a cohort
  they own. Student ids in URLs are always checked against membership, never
  trusted.
- Joining by invite requires `email_verified` from Auth0. I'll also add the
  `email_verified` check to the paid-access lookup and move it to `sub`
  (fixes the audit finding where an unverified signup with a buyer's email
  inherits their access).
- Teachers get **full course access** automatically, so they can see the
  exercises they're grading (assumption; see open questions).

## Teacher dashboard pages

All under `/teach`, in the existing Chakra dashboard layout, with a "Teach"
nav item shown only to teachers.

1. **`/teach`**: list of my cohorts. Name, students, seats used / bought,
   payment mode, last activity.
2. **`/teach/cohorts/[id]`**: the roster.
   - Header: seats used / remaining (SEATS mode), "Buy more seats", join
     code + link (copy, rotate, turn off), invite emails, pending invites.
   - Table, one row per student: name/email, lessons completed (of total),
     current lesson (the furthest started, not finished), last active,
     exercises submitted, joined date. Sortable; "export CSV". No scores.
   - Remove a student (frees their seat).
3. **`/teach/cohorts/[id]/students/[studentId]`**: the drill-down.
   - Course outline (phases → lessons) with each lesson's status.
   - Expand a lesson → each exercise → each question: **the prompt, what the
     student entered, and the correct answer side by side**, and when they
     last saved it. No grading; the teacher judges.
   - Rendering per exercise type: short answer shows each blank (student text
     vs. correct `optionText`); multiple choice / line builder show the chosen
     option vs. the correct one; matching and drag-and-drop show their
     pairings vs. the correct ones; chart/board exercises show the student's
     placements as a list (the full visual chart is a later step);
     record/repeat exercises show "completed".
   - A small "matches" hint when a typed answer equals the correct one after
     Unicode (NFC) and whitespace normalisation, so `ɑː` typed two ways reads
     the same. A display hint, not a score.

**APIs**: `GET /api/teach/cohorts`, `POST /api/teach/cohorts`,
`GET|PATCH /api/teach/cohorts/[id]`, `POST /api/teach/cohorts/[id]/invites`,
`DELETE /api/teach/cohorts/[id]/members/[userId]`,
`POST /api/teach/cohorts/[id]/checkout`,
`GET /api/teach/cohorts/[id]/students/[studentId]`,
`POST /api/join` (code or token). Roster progress is computed in a few
grouped queries (not per student) so a 60-student class stays fast.

## Housekeeping folded in (because these files are touched anyway)

- A shared Prisma client in `lib/prisma.ts`; the new routes and the files I
  edit use it. Converting the other ~20 files is mechanical and I'd do it in
  the same PR only if you want (it makes the diff noisier).
- Add `prisma generate` to the build (`"build": "prisma generate && next
  build"`).
- Migration for the missing `bio` / `interests` / `badges` columns.

## Testing against the dev database

- Migrations are additive only (new tables, new columns with defaults). No
  existing rows are changed or deleted. I'll run `prisma migrate deploy`
  against the dev DB (Supabase may need waking first).
- Test data I create (a test teacher, a test cohort, a couple of test
  students) will be on `@romerodev.co` addresses so it's easy to find and
  delete. I won't touch the 38 existing users except to read them.
- Stripe: test mode only, with `stripe listen` relaying the webhook, once the
  seat price exists.

## Open questions for you

1. ~~Pricing~~: decided, see Payment flows.
2. ~~Seat expiry~~: **seats end at the cohort's end date.** `endsAt` is
   required for SEATS cohorts. After it, seat access stops; the student keeps
   their work and can buy the course to continue.
3. ~~Pre-cohort work~~ (**yes**, as below). **Students who were already using the app**: a student who signed up and
   did lessons before joining: can the teacher see their pre-cohort work?
   My default: **yes**, the teacher sees all of the student's course work
   (it's one course), with the join date shown, and the join page tells the
   student "your teacher will be able to see your progress and answers."
4. ~~Privacy~~ (**yes**, as below). **Privacy (FERPA-ish)**: the join page will show that consent line. A
   student can leave a cohort (their data stays theirs; the teacher loses
   access). Teachers see names, emails and answers only. Anything more you
   want, like a data-processing note for universities?
5. ~~Teacher course access~~: **yes**, teachers get the full course free.
6. **Email sending**: v1 = copyable links + join code + QR. Later: Private
   Email SMTP from info@, or Resend?
7. ~~Who becomes a teacher~~: role-based access; admin assigns.
8. **One teacher per cohort** in v1 (co-teachers / TAs later). OK?
9. **Shared Prisma client**: convert all ~20 files in this PR, or only the
   ones I touch?

## Build order once approved

1. Migrations (housekeeping columns, then role / cohorts / invites /
   purchases) and `lib/prisma.ts`, `lib/teach.ts`.
2. Access change (`hasPaidAccess` by `sub` + seats + teacher), with the
   existing callers updated.
3. Cohort create, join by code and by invite.
4. Webhook rewrite + seat checkout (after the Stripe price exists).
5. Roster page, then student drill-down with per-exercise renderers.
6. Typecheck, lint, run the flows against the dev DB, open the PR.
