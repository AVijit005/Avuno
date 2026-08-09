-- Made idempotent: 0_init is generated from the current datamodel, so on a
-- fresh database these objects already exist. IF NOT EXISTS / IF EXISTS keeps
-- this a no-op there while still applying to databases created before the
-- baseline was regenerated.

-- AlterTable: Add bookmarked column to all junction tables
-- This is a safe, additive migration. All existing rows get bookmarked=false.

ALTER TABLE "user_movies" ADD COLUMN IF NOT EXISTS "bookmarked" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "user_tv_shows" ADD COLUMN IF NOT EXISTS "bookmarked" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "user_tv_seasons" ADD COLUMN IF NOT EXISTS "bookmarked" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "user_tv_episodes" ADD COLUMN IF NOT EXISTS "bookmarked" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "user_anime" ADD COLUMN IF NOT EXISTS "bookmarked" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "user_anime_episodes" ADD COLUMN IF NOT EXISTS "bookmarked" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "user_books" ADD COLUMN IF NOT EXISTS "bookmarked" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "user_games" ADD COLUMN IF NOT EXISTS "bookmarked" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "user_music_albums" ADD COLUMN IF NOT EXISTS "bookmarked" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "user_music_tracks" ADD COLUMN IF NOT EXISTS "bookmarked" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "user_podcasts" ADD COLUMN IF NOT EXISTS "bookmarked" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "user_podcast_episodes" ADD COLUMN IF NOT EXISTS "bookmarked" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "user_courses" ADD COLUMN IF NOT EXISTS "bookmarked" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "user_course_modules" ADD COLUMN IF NOT EXISTS "bookmarked" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "user_course_lessons" ADD COLUMN IF NOT EXISTS "bookmarked" BOOLEAN NOT NULL DEFAULT false;
