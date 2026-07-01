/*
  Warnings:

  - A unique constraint covering the columns `[season_id,number]` on the table `rounds` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "rounds_season_id_number_key" ON "rounds"("season_id", "number");
