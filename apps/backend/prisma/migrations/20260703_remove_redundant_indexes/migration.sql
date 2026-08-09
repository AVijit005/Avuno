-- Made idempotent: 0_init is generated from the current datamodel, so on a
-- fresh database these objects already exist. IF NOT EXISTS / IF EXISTS keeps
-- this a no-op there while still applying to databases created before the
-- baseline was regenerated.

-- DropIndex: Remove redundant standalone indexes from junction tables
-- These indexes are covered by composite indexes (userId, column) and are never queried standalone.
-- This reduces write overhead and storage without affecting query performance.

-- user_movies
DROP INDEX IF EXISTS "user_movies_status_idx";
DROP INDEX IF EXISTS "user_movies_favorite_idx";
DROP INDEX IF EXISTS "user_movies_rating_idx";
DROP INDEX IF EXISTS "user_movies_lastInteractionAt_idx";
DROP INDEX IF EXISTS "user_movies_progress_idx";

-- user_tv_shows
DROP INDEX IF EXISTS "user_tv_shows_status_idx";
DROP INDEX IF EXISTS "user_tv_shows_favorite_idx";
DROP INDEX IF EXISTS "user_tv_shows_rating_idx";
DROP INDEX IF EXISTS "user_tv_shows_lastInteractionAt_idx";
DROP INDEX IF EXISTS "user_tv_shows_progress_idx";

-- user_tv_seasons
DROP INDEX IF EXISTS "user_tv_seasons_status_idx";
DROP INDEX IF EXISTS "user_tv_seasons_favorite_idx";
DROP INDEX IF EXISTS "user_tv_seasons_rating_idx";
DROP INDEX IF EXISTS "user_tv_seasons_lastInteractionAt_idx";
DROP INDEX IF EXISTS "user_tv_seasons_progress_idx";

-- user_tv_episodes
DROP INDEX IF EXISTS "user_tv_episodes_status_idx";
DROP INDEX IF EXISTS "user_tv_episodes_favorite_idx";
DROP INDEX IF EXISTS "user_tv_episodes_rating_idx";
DROP INDEX IF EXISTS "user_tv_episodes_lastInteractionAt_idx";
DROP INDEX IF EXISTS "user_tv_episodes_progress_idx";

-- user_anime
DROP INDEX IF EXISTS "user_anime_status_idx";
DROP INDEX IF EXISTS "user_anime_favorite_idx";
DROP INDEX IF EXISTS "user_anime_rating_idx";
DROP INDEX IF EXISTS "user_anime_lastInteractionAt_idx";
DROP INDEX IF EXISTS "user_anime_progress_idx";

-- user_anime_episodes
DROP INDEX IF EXISTS "user_anime_episodes_status_idx";
DROP INDEX IF EXISTS "user_anime_episodes_favorite_idx";
DROP INDEX IF EXISTS "user_anime_episodes_rating_idx";
DROP INDEX IF EXISTS "user_anime_episodes_lastInteractionAt_idx";
DROP INDEX IF EXISTS "user_anime_episodes_progress_idx";

-- user_books
DROP INDEX IF EXISTS "user_books_status_idx";
DROP INDEX IF EXISTS "user_books_favorite_idx";
DROP INDEX IF EXISTS "user_books_rating_idx";
DROP INDEX IF EXISTS "user_books_lastInteractionAt_idx";
DROP INDEX IF EXISTS "user_books_progress_idx";

-- user_games
DROP INDEX IF EXISTS "user_games_status_idx";
DROP INDEX IF EXISTS "user_games_favorite_idx";
DROP INDEX IF EXISTS "user_games_rating_idx";
DROP INDEX IF EXISTS "user_games_lastInteractionAt_idx";
DROP INDEX IF EXISTS "user_games_progress_idx";

-- user_music_albums
DROP INDEX IF EXISTS "user_music_albums_status_idx";
DROP INDEX IF EXISTS "user_music_albums_favorite_idx";
DROP INDEX IF EXISTS "user_music_albums_rating_idx";
DROP INDEX IF EXISTS "user_music_albums_lastInteractionAt_idx";
DROP INDEX IF EXISTS "user_music_albums_progress_idx";

-- user_music_tracks
DROP INDEX IF EXISTS "user_music_tracks_status_idx";
DROP INDEX IF EXISTS "user_music_tracks_favorite_idx";
DROP INDEX IF EXISTS "user_music_tracks_rating_idx";
DROP INDEX IF EXISTS "user_music_tracks_lastInteractionAt_idx";
DROP INDEX IF EXISTS "user_music_tracks_progress_idx";

-- user_podcasts
DROP INDEX IF EXISTS "user_podcasts_status_idx";
DROP INDEX IF EXISTS "user_podcasts_favorite_idx";
DROP INDEX IF EXISTS "user_podcasts_rating_idx";
DROP INDEX IF EXISTS "user_podcasts_lastInteractionAt_idx";
DROP INDEX IF EXISTS "user_podcasts_progress_idx";

-- user_podcast_episodes
DROP INDEX IF EXISTS "user_podcast_episodes_status_idx";
DROP INDEX IF EXISTS "user_podcast_episodes_favorite_idx";
DROP INDEX IF EXISTS "user_podcast_episodes_rating_idx";
DROP INDEX IF EXISTS "user_podcast_episodes_lastInteractionAt_idx";
DROP INDEX IF EXISTS "user_podcast_episodes_progress_idx";

-- user_courses
DROP INDEX IF EXISTS "user_courses_status_idx";
DROP INDEX IF EXISTS "user_courses_favorite_idx";
DROP INDEX IF EXISTS "user_courses_rating_idx";
DROP INDEX IF EXISTS "user_courses_lastInteractionAt_idx";
DROP INDEX IF EXISTS "user_courses_progress_idx";

-- user_course_modules
DROP INDEX IF EXISTS "user_course_modules_status_idx";
DROP INDEX IF EXISTS "user_course_modules_favorite_idx";
DROP INDEX IF EXISTS "user_course_modules_rating_idx";
DROP INDEX IF EXISTS "user_course_modules_lastInteractionAt_idx";
DROP INDEX IF EXISTS "user_course_modules_progress_idx";

-- user_course_lessons
DROP INDEX IF EXISTS "user_course_lessons_status_idx";
DROP INDEX IF EXISTS "user_course_lessons_favorite_idx";
DROP INDEX IF EXISTS "user_course_lessons_rating_idx";
DROP INDEX IF EXISTS "user_course_lessons_lastInteractionAt_idx";
DROP INDEX IF EXISTS "user_course_lessons_progress_idx";
