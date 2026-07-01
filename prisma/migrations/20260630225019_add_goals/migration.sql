-- CreateTable
CREATE TABLE "goals" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "match_id" INTEGER NOT NULL,
    "team_id" INTEGER NOT NULL,
    "scorer" TEXT NOT NULL,
    "minute" INTEGER NOT NULL,
    "is_own_goal" BOOLEAN NOT NULL DEFAULT false,
    "is_penalty" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "goals_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "goals_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
