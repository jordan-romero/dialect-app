-- Role-based access, cohorts (teacher-led classes), invites and a purchase
-- ledger for Stripe.

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'TEACHER', 'ADMIN');

-- CreateEnum
CREATE TYPE "CohortPayment" AS ENUM ('SELF_PAY', 'SEATS');

-- CreateEnum
CREATE TYPE "PurchaseKind" AS ENUM ('COURSE', 'SEATS');

-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('PAID', 'REFUNDED', 'DISPUTED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'STUDENT';

-- CreateTable
CREATE TABLE "Cohort" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "institution" TEXT,
    "teacherId" INTEGER NOT NULL,
    "paymentMode" "CohortPayment" NOT NULL,
    "seatCount" INTEGER NOT NULL DEFAULT 0,
    "joinCode" TEXT NOT NULL,
    "joinEnabled" BOOLEAN NOT NULL DEFAULT true,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cohort_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CohortMember" (
    "id" SERIAL NOT NULL,
    "cohortId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usesSeat" BOOLEAN NOT NULL DEFAULT false,
    "removedAt" TIMESTAMP(3),

    CONSTRAINT "CohortMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CohortInvite" (
    "id" SERIAL NOT NULL,
    "cohortId" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),
    "acceptedBy" INTEGER,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "CohortInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Purchase" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "cohortId" INTEGER,
    "kind" "PurchaseKind" NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "amountTotal" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "stripeSessionId" TEXT NOT NULL,
    "stripePaymentIntentId" TEXT,
    "status" "PurchaseStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cohort_joinCode_key" ON "Cohort"("joinCode");

-- CreateIndex
CREATE INDEX "Cohort_teacherId_idx" ON "Cohort"("teacherId");

-- CreateIndex
CREATE INDEX "CohortMember_userId_idx" ON "CohortMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CohortMember_cohortId_userId_key" ON "CohortMember"("cohortId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "CohortInvite_token_key" ON "CohortInvite"("token");

-- CreateIndex
CREATE UNIQUE INDEX "CohortInvite_cohortId_email_key" ON "CohortInvite"("cohortId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_stripeSessionId_key" ON "Purchase"("stripeSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_stripePaymentIntentId_key" ON "Purchase"("stripePaymentIntentId");

-- AddForeignKey
ALTER TABLE "Cohort" ADD CONSTRAINT "Cohort_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CohortMember" ADD CONSTRAINT "CohortMember_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "Cohort"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CohortMember" ADD CONSTRAINT "CohortMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CohortInvite" ADD CONSTRAINT "CohortInvite_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "Cohort"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "Cohort"("id") ON DELETE SET NULL ON UPDATE CASCADE;

