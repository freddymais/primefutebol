/*
  Warnings:

  - A unique constraint covering the columns `[season_id,team_id]` on the table `standings` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "standings_season_id_team_id_key" ON "standings"("season_id", "team_id");
