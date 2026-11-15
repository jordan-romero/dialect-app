-- Admin-sold seat packages: invite a teacher, invoice, then create their class.
CREATE TYPE "TeacherInviteStatus" AS ENUM ('INVOICED', 'PAID', 'ACCEPTED', 'VOID');

CREATE TABLE "TeacherInvite" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "teacherName" TEXT,
    "institution" TEXT,
    "className" TEXT NOT NULL,
    "seats" INTEGER NOT NULL,
    "unitAmount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "billingEmail" TEXT NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "status" "TeacherInviteStatus" NOT NULL DEFAULT 'INVOICED',
    "token" TEXT NOT NULL,
    "stripeCustomerId" TEXT,
    "stripeInvoiceId" TEXT,
    "invoiceUrl" TEXT,
    "paymentIntentId" TEXT,
    "amountPaid" INTEGER,
    "paidAt" TIMESTAMP(3),
    "paidManually" BOOLEAN NOT NULL DEFAULT false,
    "emailedAt" TIMESTAMP(3),
    "emailError" TEXT,
    "acceptedAt" TIMESTAMP(3),
    "acceptedBy" INTEGER,
    "cohortId" INTEGER,
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherInvite_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TeacherInvite_token_key" ON "TeacherInvite"("token");
CREATE UNIQUE INDEX "TeacherInvite_stripeInvoiceId_key" ON "TeacherInvite"("stripeInvoiceId");
CREATE UNIQUE INDEX "TeacherInvite_cohortId_key" ON "TeacherInvite"("cohortId");
CREATE INDEX "TeacherInvite_email_idx" ON "TeacherInvite"("email");

ALTER TABLE "TeacherInvite" ADD CONSTRAINT "TeacherInvite_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "Cohort"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TeacherInvite" ADD CONSTRAINT "TeacherInvite_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
