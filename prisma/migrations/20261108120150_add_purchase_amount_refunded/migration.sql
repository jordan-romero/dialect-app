-- Track partial refunds, so a seat purchase can lose seats in proportion.
ALTER TABLE "Purchase" ADD COLUMN "amountRefunded" INTEGER NOT NULL DEFAULT 0;
