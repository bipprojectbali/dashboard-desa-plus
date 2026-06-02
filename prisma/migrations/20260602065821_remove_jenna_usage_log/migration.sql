/*
  Warnings:

  - You are about to drop the `jenna_usage_log` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "jenna_usage_log" DROP CONSTRAINT "jenna_usage_log_userId_fkey";

-- DropTable
DROP TABLE "jenna_usage_log";
