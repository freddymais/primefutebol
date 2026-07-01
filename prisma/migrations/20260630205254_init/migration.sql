-- CreateTable
CREATE TABLE "teams" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "short_name" TEXT,
    "slug" TEXT,
    "logo_url" TEXT,
    "stadium" TEXT,
    "external_id" TEXT
);

-- CreateTable
CREATE TABLE "seasons" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "year" INTEGER NOT NULL,
    "competition_name" TEXT NOT NULL DEFAULT 'Campeonato Brasileiro Série A'
);

-- CreateTable
CREATE TABLE "rounds" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "season_id" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "rounds_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "seasons" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "matches" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "round_id" INTEGER NOT NULL,
    "home_team_id" INTEGER NOT NULL,
    "away_team_id" INTEGER NOT NULL,
    "homeScore" INTEGER,
    "awayScore" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "match_datetime" TEXT NOT NULL,
    "venue" TEXT,
    "external_id" TEXT,
    "last_synced_at" TEXT,
    CONSTRAINT "matches_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "rounds" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "matches_home_team_id_fkey" FOREIGN KEY ("home_team_id") REFERENCES "teams" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "matches_away_team_id_fkey" FOREIGN KEY ("away_team_id") REFERENCES "teams" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "standings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "season_id" INTEGER NOT NULL,
    "team_id" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "played" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "draws" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "goals_for" INTEGER NOT NULL DEFAULT 0,
    "goals_against" INTEGER NOT NULL DEFAULT 0,
    "goal_difference" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "last_5" TEXT,
    "updated_at" TEXT,
    CONSTRAINT "standings_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "seasons" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "standings_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "teams_slug_key" ON "teams"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "teams_external_id_key" ON "teams"("external_id");

-- CreateIndex
CREATE UNIQUE INDEX "matches_external_id_key" ON "matches"("external_id");
