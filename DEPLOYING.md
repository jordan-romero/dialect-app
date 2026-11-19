# Deploying Acting Accents

One developer, one direction of travel:

```
feature branch ──[Promote to staging]──▶ staging ──[Promote to production]──▶ prod
                                          (testers)                            (actingaccents.com)
```

- **Every feature PR targets `staging`.** Never open a feature PR into `prod`
  (or `main`, see below).
- **`prod` only ever receives a promote PR from `staging`.** If a hotfix has to
  land on `prod` directly, merge `prod` back into `staging` straight after.
- The **Branch sync** GitHub Action (`.github/workflows/branch-sync.yml`)
  checks this on every push and every morning. If `prod` (or `main`) has a
  commit that `staging` doesn't, it opens a sync PR into `staging` so testers
  never silently miss work.

## Branches and where they deploy

All three are the same Vercel project, `common-tongue/dialect-app`.

| Branch    | Vercel environment | URL                                                   | Who uses it             |
| --------- | ------------------ | ----------------------------------------------------- | ----------------------- |
| `prod`    | Production         | https://www.actingaccents.com (apex redirects to www) | Customers               |
| `staging` | Preview            | https://actingaccents-staging.vercel.app              | Scott and other testers |
| `main`    | Preview            | https://actingaccents-main.vercel.app                 | Legacy, being retired   |
| any other | Preview            | `dialect-app-git-<branch>-common-tongue.vercel.app`   | Quick previews          |

How the URLs are wired:

- Vercel's **production branch is `prod`**, so a merge to `prod` deploys
  production. `main` is GitHub's default branch, but it does **not** deploy
  production.
- `actingaccents-staging.vercel.app` is a project domain pinned to the git
  branch `staging`. Vercel moves it to each new `staging` deployment on its
  own, so there's nothing to alias by hand. `actingaccents-main.vercel.app` is
  pinned to `main` the same way.

## Environments, secrets and databases

Secrets live in Doppler, project `acting-accents`. Prisma reads
`DEV_POSTGRES_PRISMA_URL` (pooled) and `DEV_POSTGRES_URL_NON_POOLING` (direct)
in every environment. The `DEV_` prefix is historical: open PR #65 renames them
to neutral names.

| Environment        | Secrets come from                                                                | Database (Supabase)                        |
| ------------------ | -------------------------------------------------------------------------------- | ------------------------------------------ |
| Local (`yarn dev`) | Doppler `acting-accents` / `dev` if this folder is linked, otherwise `.env`      | dev `ueyeykfexcrvpxqqaudi`                 |
| Staging            | Vercel env vars scoped to Preview + branch `staging` (copied from Doppler `dev`) | dev `ueyeykfexcrvpxqqaudi`                 |
| Production         | Vercel Production env vars                                                       | prod `acting-accents-prod` (Doppler `prd`) |

Staging and local **share one database**, so anything you seed or click
locally shows up for testers too.

> **Known gap (Nov 16, 2026):** Vercel's Production environment has no
> database, Auth0 or Stripe variables yet. Doppler `prd` holds only the two
> database URLs, so sign-in on actingaccents.com returns a 500. Production
> needs those variables (prod DB, a prod Auth0 app, live Stripe keys) before
> the first real promote.

Link this folder to Doppler once per clone (it reads `doppler.yaml`):

```bash
doppler setup --no-interactive
```

Without that, `scripts/with-env.sh` falls back to `.env`.

## Getting content and schema into each database

Vercel builds run `prisma generate && next build`. They **don't** run
migrations or seed content, so do both yourself before (or right after) the
deploy that needs them.

Course content (courses, lessons, quizzes, questions, options, resources)
lives in `prisma/seed-data.json`. `yarn seed` upserts every row by id. It's
safe to re-run and never touches users, enrollments or progress.

| Step                          | Dev DB (local and staging) | Prod DB                                                             |
| ----------------------------- | -------------------------- | ------------------------------------------------------------------- |
| Apply migrations              | `yarn db:migrate`          | `doppler run -p acting-accents -c prd -- npx prisma migrate deploy` |
| Load content                  | `yarn seed`                | `doppler run -p acting-accents -c prd -- node prisma/seed.mjs`      |
| Snapshot content back to JSON | `yarn seed:export`         | (don't: dev is the source of truth)                                 |

`yarn …` uses `dev` when the folder is linked to Doppler. Double-check which
config a command uses before you point it at prod.

## The two buttons

Both live under the repo's **Actions** tab (also in the GitHub mobile app:
repo → Actions). Pick the workflow, press **Run workflow**, fill in the box.

| Button                    | Box                | What it does                                                                                                                                                              |
| ------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Promote to staging**    | the branch to ship | Opens a PR from that branch into `staging` (or reuses the open one), updates the branch if protection asks for that, and merges it. Staging redeploys in a minute or two. |
| **Promote to production** | type `promote`     | Opens a `staging` → production PR listing every change that ships, and merges it. actingaccents.com redeploys. It never runs on its own.                                  |

Both merge with a merge commit, so the branches keep the same history and the
Branch sync check stays quiet. If a merge has conflicts, the run stops and
says so: merge the target into your branch locally, fix, push, press again.

The production button targets the branch named in the repo variable
`PRODUCTION_BRANCH` (Settings → Secrets and variables → Actions → Variables),
or `prod` when it isn't set. If Vercel's production branch ever changes,
change that one variable.

GitHub only shows a **Run workflow** button for workflows on the repo's
**default branch**, so these appear once the default branch is `staging`
(or once these files reach the current default).

## Shipping a change

1. Branch off `staging`: `git switch -c my-change origin/staging`, commit, push.
2. Press **Promote to staging** with your branch name. (Or open a PR into
   `staging` by hand and merge it. Same result.)
3. If the change needs a migration or new content, run `yarn db:migrate` /
   `yarn seed` against dev.
4. Testers check https://actingaccents-staging.vercel.app.

## Promoting staging to production

1. See what's waiting. The Branch sync run summary lists it, or:
   ```bash
   git fetch origin && git log --no-merges --oneline origin/prod..origin/staging
   ```
2. If anything in that list adds a migration or content, apply it to the prod
   DB first (table above). Migrations should be additive so the old code keeps
   working until the deploy lands.
3. Press **Promote to production** and type `promote`.
4. Check https://www.actingaccents.com once the Production deployment is Ready.

Rollback: Vercel → dialect-app → Deployments → pick the previous Production
deployment → **Instant Rollback**. Then fix forward on `staging`.

## Branch protection (intended)

There's one person on this repo, so no rule may require an approving review
(nobody can give it). Protection is only there to stop accidents:

- `staging` and `prod`: no force pushes, no deletion, changes arrive by PR.
- No "branch must be up to date" rule. It forced a branch update and a full
  Vercel rebuild before every merge, and it guards nothing here because no
  status checks are required.
