-- Made idempotent: 0_init is generated from the current datamodel, so on a
-- fresh database these objects already exist. IF NOT EXISTS / IF EXISTS keeps
-- this a no-op there while still applying to databases created before the
-- baseline was regenerated.

-- AlterTable: Add bookmarkedAt column to all junction tables
-- This restores proper bookmark timestamp semantics.
-- bookmarkedAt records when the bookmark was SET, not when the item was last updated.

ALTER TABLE "user_movies" ADD COLUMN IF NOT EXISTS "bookmarked_at" TIMESTAMP(3);
ALTER TABLE "user_tv_shows" ADD COLUMN IF NOT EXISTS "bookmarked_at" TIMESTAMP(3);
ALTER TABLE "user_tv_seasons" ADD COLUMN IF NOT EXISTS "bookmarked_at" TIMESTAMP(3);
ALTER TABLE "user_tv_episodes" ADD COLUMN IF NOT EXISTS "bookmarked_at" TIMESTAMP(3);
ALTER TABLE "user_anime" ADD COLUMN IF NOT EXISTS "bookmarked_at" TIMESTAMP(3);
ALTER TABLE "user_anime_episodes" ADD COLUMN IF NOT EXISTS "bookmarked_at" TIMESTAMP(3);
ALTER TABLE "user_books" ADD COLUMN IF NOT EXISTS "bookmarked_at" TIMESTAMP(3);
ALTER TABLE "user_games" ADD COLUMN IF NOT EXISTS "bookmarked_at" TIMESTAMP(3);
ALTER TABLE "user_music_albums" ADD COLUMN IF NOT EXISTS "bookmarked_at" TIMESTAMP(3);
ALTER TABLE "user_music_tracks" ADD COLUMN IF NOT EXISTS "bookmarked_at" TIMESTAMP(3);
ALTER TABLE "user_podcasts" ADD COLUMN IF NOT EXISTS "bookmarked_at" TIMESTAMP(3);
ALTER TABLE "user_podcast_episodes" ADD COLUMN IF NOT EXISTS "bookmarked_at" TIMESTAMP(3);
ALTER TABLE "user_courses" ADD COLUMN IF NOT EXISTS "bookmarked_at" TIMESTAMP(3);
ALTER TABLE "user_course_modules" ADD COLUMN IF NOT EXISTS "bookmarked_at" TIMESTAMP(3);
ALTER TABLE "user_course_lessons" ADD COLUMN IF NOT EXISTS "bookmarked_at" TIMESTAMP(3);
