-- Baseline schema for Chronicle/Avuno.
--
-- This file was previously EMPTY (0 bytes), so nothing in the migration
-- history ever created a table. Every subsequent migration ALTERed objects
-- that no migration had defined, which meant `prisma migrate deploy` against a
-- fresh database failed on the second migration. There was no reproducible
-- path from an empty database to the current schema, and therefore no viable
-- disaster recovery.
--
-- Generated with:
--   prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script
--
-- Because it is generated from the CURRENT datamodel it already includes the
-- end state of every later migration (bookmarked columns, the pruned indexes,
-- the RESTRICT foreign keys). Those migrations have been made idempotent so
-- they are harmless no-ops on a fresh database while still applying correctly
-- to a database created before this baseline existed.
--
-- For databases provisioned before this file existed, mark it as applied
-- rather than running it:
--   prisma migrate resolve --applied 0_init

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "user_roles" AS ENUM ('USER', 'ADMIN', 'MODERATOR');

-- CreateEnum
CREATE TYPE "user_statuses" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION');

-- CreateEnum
CREATE TYPE "oauth_providers" AS ENUM ('GOOGLE', 'GITHUB', 'APPLE', 'DISCORD', 'MICROSOFT');

-- CreateEnum
CREATE TYPE "session_statuses" AS ENUM ('ACTIVE', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "audit_actions" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'PASSWORD_CHANGE', 'PASSWORD_RESET', 'EMAIL_VERIFIED', 'OAUTH_LINK', 'OAUTH_UNLINK');

-- CreateEnum
CREATE TYPE "security_event_types" AS ENUM ('SUSPICIOUS_LOGIN', 'FAILED_LOGIN', 'SUCCESSFUL_LOGIN', 'PASSWORD_RESET_REQUESTED', 'PASSWORD_RESET_COMPLETED', 'TOKEN_REFRESH_FAILED', 'TOKEN_REFRESH_SUCCEEDED', 'ACCOUNT_LOCKED', 'ACCOUNT_UNLOCKED', 'EMAIL_VERIFICATION_SENT');

-- CreateEnum
CREATE TYPE "security_severities" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "content_statuses" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'COMING_SOON');

-- CreateEnum
CREATE TYPE "release_statuses" AS ENUM ('RELEASED', 'UPCOMING', 'IN_PRODUCTION', 'POST_PRODUCTION', 'CANCELLED', 'RUMORED');

-- CreateEnum
CREATE TYPE "content_ratings" AS ENUM ('G', 'PG', 'PG13', 'R', 'NC17', 'TV_Y', 'TV_Y7', 'TV_G', 'TV_PG', 'TV_14', 'TV_MA');

-- CreateEnum
CREATE TYPE "tv_show_statuses" AS ENUM ('AIRING', 'ENDED', 'CANCELLED', 'HIATUS', 'IN_DEVELOPMENT');

-- CreateEnum
CREATE TYPE "anime_statuses" AS ENUM ('AIRING', 'FINISHED', 'HIATUS', 'UPCOMING');

-- CreateEnum
CREATE TYPE "game_platforms" AS ENUM ('PC', 'PLAYSTATION_5', 'XBOX_SERIES_X', 'NINTENDO_SWITCH', 'MOBILE');

-- CreateEnum
CREATE TYPE "book_formats" AS ENUM ('HARDCOVER', 'PAPERBACK', 'EBOOK', 'AUDIOBOOK');

-- CreateEnum
CREATE TYPE "podcast_statuses" AS ENUM ('ACTIVE', 'HIATUS', 'ENDED');

-- CreateEnum
CREATE TYPE "course_difficulties" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "notification_types" AS ENUM ('SYSTEM', 'REMINDER', 'SOCIAL', 'WRAPPED', 'COLLECTION', 'FRIEND', 'MEDIA');

-- CreateEnum
CREATE TYPE "activity_types" AS ENUM ('WATCH', 'READ', 'PLAY', 'LISTEN', 'LEARN', 'COLLECTION', 'MEMORY', 'QUOTE', 'HIGHLIGHT', 'SEARCH', 'LOGIN', 'LOGOUT');

-- CreateEnum
CREATE TYPE "recommendation_reasons" AS ENUM ('SIMILAR', 'TRENDING', 'POPULAR', 'FRIEND_ACTIVITY', 'AI_PERSONALIZED', 'BECAUSE_YOU_LIKED');

-- CreateEnum
CREATE TYPE "visibility_levels" AS ENUM ('PRIVATE', 'FOLLOWERS', 'PUBLIC');

-- CreateEnum
CREATE TYPE "user_media_statuses" AS ENUM ('PLANNING', 'WATCHING', 'REWATCHING', 'READING', 'PLAYING', 'LISTENING', 'LEARNING', 'PAUSED', 'COMPLETED', 'DROPPED', 'ON_HOLD', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "visibilities" AS ENUM ('PRIVATE', 'PUBLIC', 'UNLISTED', 'FOLLOWERS_ONLY');

-- CreateEnum
CREATE TYPE "moods" AS ENUM ('VERY_HAPPY', 'HAPPY', 'CALM', 'NEUTRAL', 'SAD', 'VERY_SAD', 'EXCITED', 'EMOTIONAL', 'ANGRY', 'NOSTALGIC');

-- CreateEnum
CREATE TYPE "timeline_event_types" AS ENUM ('STARTED', 'COMPLETED', 'PAUSED', 'DROPPED', 'REWATCHED', 'REREAD', 'REPLAYED', 'FAVORITED', 'RATED', 'COLLECTION_CREATED', 'SHELF_CREATED', 'MEMORY_CREATED', 'JOURNAL_CREATED', 'QUOTE_ADDED', 'HIGHLIGHT_ADDED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "name" TEXT,
    "display_name" TEXT,
    "username" TEXT,
    "bio" TEXT,
    "location" TEXT,
    "website" TEXT,
    "timezone" TEXT DEFAULT 'UTC',
    "language" TEXT DEFAULT 'en',
    "date_format" TEXT DEFAULT 'MM/DD/YYYY',
    "theme_preference" TEXT DEFAULT 'system',
    "avatar" TEXT,
    "cover_image" TEXT,
    "preferences" JSONB,
    "privacy" JSONB,
    "role" "user_roles" NOT NULL DEFAULT 'USER',
    "status" "user_statuses" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oauth_accounts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "provider" "oauth_providers" NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "oauth_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "status" "session_statuses" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_verification_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_verification_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "action" "audit_actions" NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "previous_value" JSONB,
    "new_value" JSONB,
    "metadata" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_events" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "event_type" "security_event_types" NOT NULL,
    "severity" "security_severities" NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "security_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movies" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "original_title" TEXT,
    "description" TEXT,
    "overview" TEXT,
    "poster_url" TEXT,
    "backdrop_url" TEXT,
    "banner_url" TEXT,
    "cover_image" TEXT,
    "thumbnail" TEXT,
    "release_date" TIMESTAMP(3),
    "release_year" INTEGER,
    "runtime" INTEGER,
    "duration" INTEGER,
    "language" TEXT,
    "country" TEXT,
    "genres" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "external_ids" JSONB,
    "metadata" JSONB,
    "status" "content_statuses" NOT NULL DEFAULT 'DRAFT',
    "content_rating" "content_ratings",
    "release_status" "release_statuses",
    "budget" DECIMAL(15,2),
    "revenue" DECIMAL(15,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "movies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tv_shows" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "original_title" TEXT,
    "description" TEXT,
    "overview" TEXT,
    "poster_url" TEXT,
    "backdrop_url" TEXT,
    "banner_url" TEXT,
    "cover_image" TEXT,
    "thumbnail" TEXT,
    "release_date" TIMESTAMP(3),
    "release_year" INTEGER,
    "runtime" INTEGER,
    "duration" INTEGER,
    "language" TEXT,
    "country" TEXT,
    "genres" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "external_ids" JSONB,
    "metadata" JSONB,
    "status" "content_statuses" NOT NULL DEFAULT 'DRAFT',
    "content_rating" "content_ratings",
    "tv_show_status" "tv_show_statuses",
    "total_seasons" INTEGER DEFAULT 0,
    "total_episodes" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "tv_shows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tv_seasons" (
    "id" UUID NOT NULL,
    "tv_show_id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "original_title" TEXT,
    "description" TEXT,
    "overview" TEXT,
    "poster_url" TEXT,
    "backdrop_url" TEXT,
    "banner_url" TEXT,
    "cover_image" TEXT,
    "thumbnail" TEXT,
    "release_date" TIMESTAMP(3),
    "release_year" INTEGER,
    "runtime" INTEGER,
    "duration" INTEGER,
    "language" TEXT,
    "country" TEXT,
    "genres" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "external_ids" JSONB,
    "metadata" JSONB,
    "season_number" INTEGER NOT NULL,
    "status" "content_statuses" NOT NULL DEFAULT 'DRAFT',
    "content_rating" "content_ratings",
    "total_episodes" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "tv_seasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tv_episodes" (
    "id" UUID NOT NULL,
    "tv_season_id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "original_title" TEXT,
    "description" TEXT,
    "overview" TEXT,
    "poster_url" TEXT,
    "backdrop_url" TEXT,
    "banner_url" TEXT,
    "cover_image" TEXT,
    "thumbnail" TEXT,
    "release_date" TIMESTAMP(3),
    "release_year" INTEGER,
    "runtime" INTEGER,
    "duration" INTEGER,
    "language" TEXT,
    "country" TEXT,
    "genres" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "external_ids" JSONB,
    "metadata" JSONB,
    "episode_number" INTEGER NOT NULL,
    "status" "content_statuses" NOT NULL DEFAULT 'DRAFT',
    "content_rating" "content_ratings",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "tv_episodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anime" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "original_title" TEXT,
    "description" TEXT,
    "overview" TEXT,
    "poster_url" TEXT,
    "backdrop_url" TEXT,
    "banner_url" TEXT,
    "cover_image" TEXT,
    "thumbnail" TEXT,
    "release_date" TIMESTAMP(3),
    "release_year" INTEGER,
    "runtime" INTEGER,
    "duration" INTEGER,
    "language" TEXT,
    "country" TEXT,
    "genres" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "external_ids" JSONB,
    "metadata" JSONB,
    "status" "content_statuses" NOT NULL DEFAULT 'DRAFT',
    "content_rating" "content_ratings",
    "anime_status" "anime_statuses",
    "total_episodes" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "anime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anime_episodes" (
    "id" UUID NOT NULL,
    "anime_id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "original_title" TEXT,
    "description" TEXT,
    "overview" TEXT,
    "poster_url" TEXT,
    "backdrop_url" TEXT,
    "banner_url" TEXT,
    "cover_image" TEXT,
    "thumbnail" TEXT,
    "release_date" TIMESTAMP(3),
    "release_year" INTEGER,
    "runtime" INTEGER,
    "duration" INTEGER,
    "language" TEXT,
    "country" TEXT,
    "genres" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "external_ids" JSONB,
    "metadata" JSONB,
    "episode_number" INTEGER NOT NULL,
    "status" "content_statuses" NOT NULL DEFAULT 'DRAFT',
    "content_rating" "content_ratings",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "anime_episodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "books" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "original_title" TEXT,
    "description" TEXT,
    "overview" TEXT,
    "poster_url" TEXT,
    "backdrop_url" TEXT,
    "banner_url" TEXT,
    "cover_image" TEXT,
    "thumbnail" TEXT,
    "release_date" TIMESTAMP(3),
    "release_year" INTEGER,
    "runtime" INTEGER,
    "duration" INTEGER,
    "language" TEXT,
    "country" TEXT,
    "genres" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "external_ids" JSONB,
    "metadata" JSONB,
    "status" "content_statuses" NOT NULL DEFAULT 'DRAFT',
    "isbn" TEXT,
    "format" "book_formats",
    "page_count" INTEGER,
    "author" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "books_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "games" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "original_title" TEXT,
    "description" TEXT,
    "overview" TEXT,
    "poster_url" TEXT,
    "backdrop_url" TEXT,
    "banner_url" TEXT,
    "cover_image" TEXT,
    "thumbnail" TEXT,
    "release_date" TIMESTAMP(3),
    "release_year" INTEGER,
    "runtime" INTEGER,
    "duration" INTEGER,
    "language" TEXT,
    "country" TEXT,
    "genres" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "external_ids" JSONB,
    "metadata" JSONB,
    "status" "content_statuses" NOT NULL DEFAULT 'DRAFT',
    "content_rating" "content_ratings",
    "release_status" "release_statuses",
    "platform" "game_platforms",
    "publisher" TEXT,
    "developer" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "music_artists" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "overview" TEXT,
    "poster_url" TEXT,
    "backdrop_url" TEXT,
    "banner_url" TEXT,
    "cover_image" TEXT,
    "thumbnail" TEXT,
    "release_date" TIMESTAMP(3),
    "release_year" INTEGER,
    "runtime" INTEGER,
    "duration" INTEGER,
    "language" TEXT,
    "country" TEXT,
    "genres" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "external_ids" JSONB,
    "metadata" JSONB,
    "status" "content_statuses" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "music_artists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "music_albums" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "original_title" TEXT,
    "description" TEXT,
    "overview" TEXT,
    "poster_url" TEXT,
    "backdrop_url" TEXT,
    "banner_url" TEXT,
    "cover_image" TEXT,
    "thumbnail" TEXT,
    "release_date" TIMESTAMP(3),
    "release_year" INTEGER,
    "runtime" INTEGER,
    "duration" INTEGER,
    "language" TEXT,
    "country" TEXT,
    "genres" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "external_ids" JSONB,
    "metadata" JSONB,
    "status" "content_statuses" NOT NULL DEFAULT 'DRAFT',
    "artist_display_name" TEXT,
    "release_type" TEXT,
    "total_tracks" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "music_albums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "music_tracks" (
    "id" UUID NOT NULL,
    "music_album_id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "original_title" TEXT,
    "description" TEXT,
    "overview" TEXT,
    "poster_url" TEXT,
    "backdrop_url" TEXT,
    "banner_url" TEXT,
    "cover_image" TEXT,
    "thumbnail" TEXT,
    "release_date" TIMESTAMP(3),
    "release_year" INTEGER,
    "runtime" INTEGER,
    "duration" INTEGER,
    "language" TEXT,
    "country" TEXT,
    "genres" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "external_ids" JSONB,
    "metadata" JSONB,
    "track_number" INTEGER NOT NULL,
    "status" "content_statuses" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "music_tracks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "podcasts" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "original_title" TEXT,
    "description" TEXT,
    "overview" TEXT,
    "poster_url" TEXT,
    "backdrop_url" TEXT,
    "banner_url" TEXT,
    "cover_image" TEXT,
    "thumbnail" TEXT,
    "release_date" TIMESTAMP(3),
    "release_year" INTEGER,
    "runtime" INTEGER,
    "duration" INTEGER,
    "language" TEXT,
    "country" TEXT,
    "genres" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "external_ids" JSONB,
    "metadata" JSONB,
    "status" "content_statuses" NOT NULL DEFAULT 'DRAFT',
    "podcast_status" "podcast_statuses",
    "total_episodes" INTEGER DEFAULT 0,
    "author" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "podcasts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "podcast_episodes" (
    "id" UUID NOT NULL,
    "podcast_id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "original_title" TEXT,
    "description" TEXT,
    "overview" TEXT,
    "poster_url" TEXT,
    "backdrop_url" TEXT,
    "banner_url" TEXT,
    "cover_image" TEXT,
    "thumbnail" TEXT,
    "release_date" TIMESTAMP(3),
    "release_year" INTEGER,
    "runtime" INTEGER,
    "duration" INTEGER,
    "language" TEXT,
    "country" TEXT,
    "genres" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "external_ids" JSONB,
    "metadata" JSONB,
    "episode_number" INTEGER NOT NULL,
    "status" "content_statuses" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "podcast_episodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "original_title" TEXT,
    "description" TEXT,
    "overview" TEXT,
    "poster_url" TEXT,
    "backdrop_url" TEXT,
    "banner_url" TEXT,
    "cover_image" TEXT,
    "thumbnail" TEXT,
    "release_date" TIMESTAMP(3),
    "release_year" INTEGER,
    "runtime" INTEGER,
    "duration" INTEGER,
    "language" TEXT,
    "country" TEXT,
    "genres" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "external_ids" JSONB,
    "metadata" JSONB,
    "status" "content_statuses" NOT NULL DEFAULT 'DRAFT',
    "difficulty" "course_difficulties",
    "instructor" TEXT,
    "total_modules" INTEGER DEFAULT 0,
    "total_lessons" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_modules" (
    "id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "original_title" TEXT,
    "description" TEXT,
    "overview" TEXT,
    "poster_url" TEXT,
    "backdrop_url" TEXT,
    "banner_url" TEXT,
    "cover_image" TEXT,
    "thumbnail" TEXT,
    "release_date" TIMESTAMP(3),
    "release_year" INTEGER,
    "runtime" INTEGER,
    "duration" INTEGER,
    "language" TEXT,
    "country" TEXT,
    "genres" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "external_ids" JSONB,
    "metadata" JSONB,
    "module_number" INTEGER NOT NULL,
    "status" "content_statuses" NOT NULL DEFAULT 'DRAFT',
    "total_lessons" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "course_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_lessons" (
    "id" UUID NOT NULL,
    "course_module_id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "original_title" TEXT,
    "description" TEXT,
    "overview" TEXT,
    "poster_url" TEXT,
    "backdrop_url" TEXT,
    "banner_url" TEXT,
    "cover_image" TEXT,
    "thumbnail" TEXT,
    "release_date" TIMESTAMP(3),
    "release_year" INTEGER,
    "runtime" INTEGER,
    "duration" INTEGER,
    "language" TEXT,
    "country" TEXT,
    "genres" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "external_ids" JSONB,
    "metadata" JSONB,
    "lesson_number" INTEGER NOT NULL,
    "status" "content_statuses" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "course_lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_movies" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "movie_id" UUID NOT NULL,
    "status" "user_media_statuses" NOT NULL DEFAULT 'PLANNING',
    "rating" INTEGER,
    "rewatch_count" INTEGER DEFAULT 0,
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "bookmarked" BOOLEAN NOT NULL DEFAULT false,
    "bookmarked_at" TIMESTAMP(3),
    "liked" BOOLEAN,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "private" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),
    "last_interaction_at" TIMESTAMP(3),
    "progress" INTEGER DEFAULT 0,
    "progress_percentage" DOUBLE PRECISION DEFAULT 0,
    "current_episode" INTEGER,
    "current_season" INTEGER,
    "current_chapter" INTEGER,
    "current_page" INTEGER,
    "current_track" INTEGER,
    "current_lesson" INTEGER,
    "hours_spent" INTEGER DEFAULT 0,
    "minutes_spent" INTEGER DEFAULT 0,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "user_movies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_tv_shows" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "tv_show_id" UUID NOT NULL,
    "status" "user_media_statuses" NOT NULL DEFAULT 'PLANNING',
    "rating" INTEGER,
    "rewatch_count" INTEGER DEFAULT 0,
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "bookmarked" BOOLEAN NOT NULL DEFAULT false,
    "bookmarked_at" TIMESTAMP(3),
    "liked" BOOLEAN,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "private" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),
    "last_interaction_at" TIMESTAMP(3),
    "progress" INTEGER DEFAULT 0,
    "progress_percentage" DOUBLE PRECISION DEFAULT 0,
    "current_episode" INTEGER,
    "current_season" INTEGER,
    "current_chapter" INTEGER,
    "current_page" INTEGER,
    "current_track" INTEGER,
    "current_lesson" INTEGER,
    "hours_spent" INTEGER DEFAULT 0,
    "minutes_spent" INTEGER DEFAULT 0,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "user_tv_shows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_tv_seasons" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "tv_season_id" UUID NOT NULL,
    "status" "user_media_statuses" NOT NULL DEFAULT 'PLANNING',
    "rating" INTEGER,
    "rewatch_count" INTEGER DEFAULT 0,
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "bookmarked" BOOLEAN NOT NULL DEFAULT false,
    "bookmarked_at" TIMESTAMP(3),
    "liked" BOOLEAN,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "private" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),
    "last_interaction_at" TIMESTAMP(3),
    "progress" INTEGER DEFAULT 0,
    "progress_percentage" DOUBLE PRECISION DEFAULT 0,
    "current_episode" INTEGER,
    "current_season" INTEGER,
    "current_chapter" INTEGER,
    "current_page" INTEGER,
    "current_track" INTEGER,
    "current_lesson" INTEGER,
    "hours_spent" INTEGER DEFAULT 0,
    "minutes_spent" INTEGER DEFAULT 0,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "user_tv_seasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_tv_episodes" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "tv_episode_id" UUID NOT NULL,
    "status" "user_media_statuses" NOT NULL DEFAULT 'PLANNING',
    "rating" INTEGER,
    "rewatch_count" INTEGER DEFAULT 0,
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "bookmarked" BOOLEAN NOT NULL DEFAULT false,
    "bookmarked_at" TIMESTAMP(3),
    "liked" BOOLEAN,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "private" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),
    "last_interaction_at" TIMESTAMP(3),
    "progress" INTEGER DEFAULT 0,
    "progress_percentage" DOUBLE PRECISION DEFAULT 0,
    "current_episode" INTEGER,
    "current_season" INTEGER,
    "current_chapter" INTEGER,
    "current_page" INTEGER,
    "current_track" INTEGER,
    "current_lesson" INTEGER,
    "hours_spent" INTEGER DEFAULT 0,
    "minutes_spent" INTEGER DEFAULT 0,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "user_tv_episodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_anime" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "anime_id" UUID NOT NULL,
    "status" "user_media_statuses" NOT NULL DEFAULT 'PLANNING',
    "rating" INTEGER,
    "rewatch_count" INTEGER DEFAULT 0,
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "bookmarked" BOOLEAN NOT NULL DEFAULT false,
    "bookmarked_at" TIMESTAMP(3),
    "liked" BOOLEAN,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "private" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),
    "last_interaction_at" TIMESTAMP(3),
    "progress" INTEGER DEFAULT 0,
    "progress_percentage" DOUBLE PRECISION DEFAULT 0,
    "current_episode" INTEGER,
    "current_season" INTEGER,
    "current_chapter" INTEGER,
    "current_page" INTEGER,
    "current_track" INTEGER,
    "current_lesson" INTEGER,
    "hours_spent" INTEGER DEFAULT 0,
    "minutes_spent" INTEGER DEFAULT 0,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "user_anime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_anime_episodes" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "anime_episode_id" UUID NOT NULL,
    "status" "user_media_statuses" NOT NULL DEFAULT 'PLANNING',
    "rating" INTEGER,
    "rewatch_count" INTEGER DEFAULT 0,
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "bookmarked" BOOLEAN NOT NULL DEFAULT false,
    "bookmarked_at" TIMESTAMP(3),
    "liked" BOOLEAN,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "private" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),
    "last_interaction_at" TIMESTAMP(3),
    "progress" INTEGER DEFAULT 0,
    "progress_percentage" DOUBLE PRECISION DEFAULT 0,
    "current_episode" INTEGER,
    "current_season" INTEGER,
    "current_chapter" INTEGER,
    "current_page" INTEGER,
    "current_track" INTEGER,
    "current_lesson" INTEGER,
    "hours_spent" INTEGER DEFAULT 0,
    "minutes_spent" INTEGER DEFAULT 0,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "user_anime_episodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_books" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "book_id" UUID NOT NULL,
    "status" "user_media_statuses" NOT NULL DEFAULT 'PLANNING',
    "rating" INTEGER,
    "rewatch_count" INTEGER DEFAULT 0,
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "bookmarked" BOOLEAN NOT NULL DEFAULT false,
    "bookmarked_at" TIMESTAMP(3),
    "liked" BOOLEAN,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "private" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),
    "last_interaction_at" TIMESTAMP(3),
    "progress" INTEGER DEFAULT 0,
    "progress_percentage" DOUBLE PRECISION DEFAULT 0,
    "current_episode" INTEGER,
    "current_season" INTEGER,
    "current_chapter" INTEGER,
    "current_page" INTEGER,
    "current_track" INTEGER,
    "current_lesson" INTEGER,
    "hours_spent" INTEGER DEFAULT 0,
    "minutes_spent" INTEGER DEFAULT 0,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "user_books_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_games" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "game_id" UUID NOT NULL,
    "status" "user_media_statuses" NOT NULL DEFAULT 'PLANNING',
    "rating" INTEGER,
    "rewatch_count" INTEGER DEFAULT 0,
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "bookmarked" BOOLEAN NOT NULL DEFAULT false,
    "bookmarked_at" TIMESTAMP(3),
    "liked" BOOLEAN,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "private" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),
    "last_interaction_at" TIMESTAMP(3),
    "progress" INTEGER DEFAULT 0,
    "progress_percentage" DOUBLE PRECISION DEFAULT 0,
    "current_episode" INTEGER,
    "current_season" INTEGER,
    "current_chapter" INTEGER,
    "current_page" INTEGER,
    "current_track" INTEGER,
    "current_lesson" INTEGER,
    "hours_spent" INTEGER DEFAULT 0,
    "minutes_spent" INTEGER DEFAULT 0,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "user_games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_music_albums" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "music_album_id" UUID NOT NULL,
    "status" "user_media_statuses" NOT NULL DEFAULT 'PLANNING',
    "rating" INTEGER,
    "rewatch_count" INTEGER DEFAULT 0,
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "bookmarked" BOOLEAN NOT NULL DEFAULT false,
    "bookmarked_at" TIMESTAMP(3),
    "liked" BOOLEAN,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "private" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),
    "last_interaction_at" TIMESTAMP(3),
    "progress" INTEGER DEFAULT 0,
    "progress_percentage" DOUBLE PRECISION DEFAULT 0,
    "current_episode" INTEGER,
    "current_season" INTEGER,
    "current_chapter" INTEGER,
    "current_page" INTEGER,
    "current_track" INTEGER,
    "current_lesson" INTEGER,
    "hours_spent" INTEGER DEFAULT 0,
    "minutes_spent" INTEGER DEFAULT 0,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "user_music_albums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_music_tracks" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "music_track_id" UUID NOT NULL,
    "status" "user_media_statuses" NOT NULL DEFAULT 'PLANNING',
    "rating" INTEGER,
    "rewatch_count" INTEGER DEFAULT 0,
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "bookmarked" BOOLEAN NOT NULL DEFAULT false,
    "bookmarked_at" TIMESTAMP(3),
    "liked" BOOLEAN,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "private" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),
    "last_interaction_at" TIMESTAMP(3),
    "progress" INTEGER DEFAULT 0,
    "progress_percentage" DOUBLE PRECISION DEFAULT 0,
    "current_episode" INTEGER,
    "current_season" INTEGER,
    "current_chapter" INTEGER,
    "current_page" INTEGER,
    "current_track" INTEGER,
    "current_lesson" INTEGER,
    "hours_spent" INTEGER DEFAULT 0,
    "minutes_spent" INTEGER DEFAULT 0,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "user_music_tracks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_podcasts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "podcast_id" UUID NOT NULL,
    "status" "user_media_statuses" NOT NULL DEFAULT 'PLANNING',
    "rating" INTEGER,
    "rewatch_count" INTEGER DEFAULT 0,
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "bookmarked" BOOLEAN NOT NULL DEFAULT false,
    "bookmarked_at" TIMESTAMP(3),
    "liked" BOOLEAN,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "private" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),
    "last_interaction_at" TIMESTAMP(3),
    "progress" INTEGER DEFAULT 0,
    "progress_percentage" DOUBLE PRECISION DEFAULT 0,
    "current_episode" INTEGER,
    "current_season" INTEGER,
    "current_chapter" INTEGER,
    "current_page" INTEGER,
    "current_track" INTEGER,
    "current_lesson" INTEGER,
    "hours_spent" INTEGER DEFAULT 0,
    "minutes_spent" INTEGER DEFAULT 0,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "user_podcasts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_podcast_episodes" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "podcast_episode_id" UUID NOT NULL,
    "status" "user_media_statuses" NOT NULL DEFAULT 'PLANNING',
    "rating" INTEGER,
    "rewatch_count" INTEGER DEFAULT 0,
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "bookmarked" BOOLEAN NOT NULL DEFAULT false,
    "bookmarked_at" TIMESTAMP(3),
    "liked" BOOLEAN,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "private" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),
    "last_interaction_at" TIMESTAMP(3),
    "progress" INTEGER DEFAULT 0,
    "progress_percentage" DOUBLE PRECISION DEFAULT 0,
    "current_episode" INTEGER,
    "current_season" INTEGER,
    "current_chapter" INTEGER,
    "current_page" INTEGER,
    "current_track" INTEGER,
    "current_lesson" INTEGER,
    "hours_spent" INTEGER DEFAULT 0,
    "minutes_spent" INTEGER DEFAULT 0,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "user_podcast_episodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_courses" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "status" "user_media_statuses" NOT NULL DEFAULT 'PLANNING',
    "rating" INTEGER,
    "rewatch_count" INTEGER DEFAULT 0,
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "bookmarked" BOOLEAN NOT NULL DEFAULT false,
    "bookmarked_at" TIMESTAMP(3),
    "liked" BOOLEAN,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "private" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),
    "last_interaction_at" TIMESTAMP(3),
    "progress" INTEGER DEFAULT 0,
    "progress_percentage" DOUBLE PRECISION DEFAULT 0,
    "current_episode" INTEGER,
    "current_season" INTEGER,
    "current_chapter" INTEGER,
    "current_page" INTEGER,
    "current_track" INTEGER,
    "current_lesson" INTEGER,
    "hours_spent" INTEGER DEFAULT 0,
    "minutes_spent" INTEGER DEFAULT 0,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "user_courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_course_modules" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "course_module_id" UUID NOT NULL,
    "status" "user_media_statuses" NOT NULL DEFAULT 'PLANNING',
    "rating" INTEGER,
    "rewatch_count" INTEGER DEFAULT 0,
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "bookmarked" BOOLEAN NOT NULL DEFAULT false,
    "bookmarked_at" TIMESTAMP(3),
    "liked" BOOLEAN,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "private" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),
    "last_interaction_at" TIMESTAMP(3),
    "progress" INTEGER DEFAULT 0,
    "progress_percentage" DOUBLE PRECISION DEFAULT 0,
    "current_episode" INTEGER,
    "current_season" INTEGER,
    "current_chapter" INTEGER,
    "current_page" INTEGER,
    "current_track" INTEGER,
    "current_lesson" INTEGER,
    "hours_spent" INTEGER DEFAULT 0,
    "minutes_spent" INTEGER DEFAULT 0,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "user_course_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_course_lessons" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "course_lesson_id" UUID NOT NULL,
    "status" "user_media_statuses" NOT NULL DEFAULT 'PLANNING',
    "rating" INTEGER,
    "rewatch_count" INTEGER DEFAULT 0,
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "bookmarked" BOOLEAN NOT NULL DEFAULT false,
    "bookmarked_at" TIMESTAMP(3),
    "liked" BOOLEAN,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "private" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),
    "last_interaction_at" TIMESTAMP(3),
    "progress" INTEGER DEFAULT 0,
    "progress_percentage" DOUBLE PRECISION DEFAULT 0,
    "current_episode" INTEGER,
    "current_season" INTEGER,
    "current_chapter" INTEGER,
    "current_page" INTEGER,
    "current_track" INTEGER,
    "current_lesson" INTEGER,
    "hours_spent" INTEGER DEFAULT 0,
    "minutes_spent" INTEGER DEFAULT 0,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "user_course_lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collections" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "cover_image" TEXT,
    "visibility" "visibilities" NOT NULL DEFAULT 'PRIVATE',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "is_smart_collection" BOOLEAN NOT NULL DEFAULT false,
    "icon" TEXT,
    "color" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_items" (
    "id" UUID NOT NULL,
    "collection_id" UUID NOT NULL,
    "movie_id" UUID,
    "tv_show_id" UUID,
    "anime_id" UUID,
    "book_id" UUID,
    "game_id" UUID,
    "music_album_id" UUID,
    "podcast_id" UUID,
    "course_id" UUID,
    "position" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collection_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shelves" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "visibility" "visibilities" NOT NULL DEFAULT 'PRIVATE',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "icon" TEXT,
    "color" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shelves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shelf_items" (
    "id" UUID NOT NULL,
    "shelf_id" UUID NOT NULL,
    "movie_id" UUID,
    "tv_show_id" UUID,
    "anime_id" UUID,
    "book_id" UUID,
    "game_id" UUID,
    "music_album_id" UUID,
    "podcast_id" UUID,
    "course_id" UUID,
    "position" INTEGER NOT NULL DEFAULT 0,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shelf_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_lists" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "cover_image" TEXT,
    "visibility" "visibilities" NOT NULL DEFAULT 'PRIVATE',
    "likes_count" INTEGER NOT NULL DEFAULT 0,
    "comments_count" INTEGER NOT NULL DEFAULT 0,
    "share_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_list_items" (
    "id" UUID NOT NULL,
    "custom_list_id" UUID NOT NULL,
    "movie_id" UUID,
    "tv_show_id" UUID,
    "anime_id" UUID,
    "book_id" UUID,
    "game_id" UUID,
    "music_album_id" UUID,
    "podcast_id" UUID,
    "course_id" UUID,
    "position" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "custom_list_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "color" TEXT,
    "icon" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_tags" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "color" TEXT,
    "icon" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_tags" (
    "id" UUID NOT NULL,
    "tag_id" UUID,
    "user_tag_id" UUID,
    "movie_id" UUID,
    "tv_show_id" UUID,
    "anime_id" UUID,
    "book_id" UUID,
    "game_id" UUID,
    "music_album_id" UUID,
    "podcast_id" UUID,
    "course_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_entries" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "mood" "moods",
    "weather" TEXT,
    "location" TEXT,
    "cover_image" TEXT,
    "is_private" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "journal_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memories" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "memory_date" TIMESTAMP(3),
    "cover_image" TEXT,
    "location" TEXT,
    "emotion" TEXT,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "is_private" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "memories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memory_media" (
    "id" UUID NOT NULL,
    "memory_id" UUID NOT NULL,
    "movie_id" UUID,
    "tv_show_id" UUID,
    "anime_id" UUID,
    "book_id" UUID,
    "game_id" UUID,
    "music_album_id" UUID,
    "podcast_id" UUID,
    "course_id" UUID,
    "position" INTEGER NOT NULL DEFAULT 0,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "memory_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timeline_events" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "timeline_event_types" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "event_date" TIMESTAMP(3) NOT NULL,
    "icon" TEXT,
    "color" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "timeline_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorite_quotes" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "speaker" TEXT,
    "language" TEXT,
    "translation" TEXT,
    "note" TEXT,
    "movie_id" UUID,
    "tv_show_id" UUID,
    "anime_id" UUID,
    "book_id" UUID,
    "game_id" UUID,
    "podcast_id" UUID,
    "course_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "favorite_quotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "highlights" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "timestamp" INTEGER,
    "chapter" INTEGER,
    "page" INTEGER,
    "episode" INTEGER,
    "season" INTEGER,
    "track" INTEGER,
    "lesson" INTEGER,
    "movie_id" UUID,
    "tv_show_id" UUID,
    "anime_id" UUID,
    "book_id" UUID,
    "game_id" UUID,
    "music_album_id" UUID,
    "podcast_id" UUID,
    "course_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "highlights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_histories" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "query" TEXT NOT NULL,
    "filters" JSONB,
    "results_count" INTEGER NOT NULL DEFAULT 0,
    "searched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "search_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_searches" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "filters" JSONB,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_searches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "type" "notification_types" NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "action_url" TEXT,
    "image" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" TIMESTAMP(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "email_enabled" BOOLEAN NOT NULL DEFAULT true,
    "push_enabled" BOOLEAN NOT NULL DEFAULT true,
    "browser_enabled" BOOLEAN NOT NULL DEFAULT true,
    "marketing_enabled" BOOLEAN NOT NULL DEFAULT false,
    "weekly_wrapped" BOOLEAN NOT NULL DEFAULT true,
    "monthly_report" BOOLEAN NOT NULL DEFAULT true,
    "friend_activity" BOOLEAN NOT NULL DEFAULT true,
    "reminders" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_feed" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "activity_types" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "visibility" "visibility_levels" NOT NULL DEFAULT 'PRIVATE',
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_feed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendations" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "reason" "recommendation_reasons" NOT NULL,
    "score" DOUBLE PRECISION,
    "movie_id" UUID,
    "tv_show_id" UUID,
    "anime_id" UUID,
    "book_id" UUID,
    "game_id" UUID,
    "music_album_id" UUID,
    "podcast_id" UUID,
    "course_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wrapped_years" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "cover_image" TEXT,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "wrapped_years_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wrapped_stats" (
    "id" UUID NOT NULL,
    "wrapped_year_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "icon" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "wrapped_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_snapshots" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "snapshot_date" DATE NOT NULL,
    "movies_completed" INTEGER NOT NULL DEFAULT 0,
    "episodes_watched" INTEGER NOT NULL DEFAULT 0,
    "books_finished" INTEGER NOT NULL DEFAULT 0,
    "games_finished" INTEGER NOT NULL DEFAULT 0,
    "courses_completed" INTEGER NOT NULL DEFAULT 0,
    "hours_watched" INTEGER NOT NULL DEFAULT 0,
    "hours_played" INTEGER NOT NULL DEFAULT 0,
    "hours_read" INTEGER NOT NULL DEFAULT 0,
    "hours_learned" INTEGER NOT NULL DEFAULT 0,
    "favorite_genre" TEXT,
    "favorite_platform" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "device_name" TEXT,
    "device_type" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "ip_address" TEXT,
    "country" TEXT,
    "city" TEXT,
    "last_seen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "device_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MusicAlbumToMusicArtist" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_MusicAlbumToMusicArtist_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "oauth_accounts_user_id_idx" ON "oauth_accounts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_accounts_provider_provider_account_id_key" ON "oauth_accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX "sessions_expires_at_idx" ON "sessions"("expires_at");

-- CreateIndex
CREATE INDEX "sessions_status_idx" ON "sessions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_expires_at_idx" ON "refresh_tokens"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_hash_key" ON "password_reset_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_user_id_idx" ON "password_reset_tokens"("user_id");

-- CreateIndex
CREATE INDEX "password_reset_tokens_expires_at_idx" ON "password_reset_tokens"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "email_verification_tokens_token_hash_key" ON "email_verification_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "email_verification_tokens_user_id_idx" ON "email_verification_tokens"("user_id");

-- CreateIndex
CREATE INDEX "email_verification_tokens_expires_at_idx" ON "email_verification_tokens"("expires_at");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "security_events_user_id_idx" ON "security_events"("user_id");

-- CreateIndex
CREATE INDEX "security_events_event_type_idx" ON "security_events"("event_type");

-- CreateIndex
CREATE INDEX "security_events_severity_idx" ON "security_events"("severity");

-- CreateIndex
CREATE INDEX "security_events_created_at_idx" ON "security_events"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "movies_slug_key" ON "movies"("slug");

-- CreateIndex
CREATE INDEX "movies_title_idx" ON "movies"("title");

-- CreateIndex
CREATE INDEX "movies_release_year_idx" ON "movies"("release_year");

-- CreateIndex
CREATE INDEX "movies_country_idx" ON "movies"("country");

-- CreateIndex
CREATE INDEX "movies_content_rating_idx" ON "movies"("content_rating");

-- CreateIndex
CREATE INDEX "movies_release_status_idx" ON "movies"("release_status");

-- CreateIndex
CREATE INDEX "movies_created_at_idx" ON "movies"("created_at");

-- CreateIndex
CREATE INDEX "movies_updated_at_idx" ON "movies"("updated_at");

-- CreateIndex
CREATE INDEX "movies_status_release_year_idx" ON "movies"("status", "release_year");

-- CreateIndex
CREATE INDEX "movies_language_country_idx" ON "movies"("language", "country");

-- CreateIndex
CREATE UNIQUE INDEX "tv_shows_slug_key" ON "tv_shows"("slug");

-- CreateIndex
CREATE INDEX "tv_shows_title_idx" ON "tv_shows"("title");

-- CreateIndex
CREATE INDEX "tv_shows_release_year_idx" ON "tv_shows"("release_year");

-- CreateIndex
CREATE INDEX "tv_shows_country_idx" ON "tv_shows"("country");

-- CreateIndex
CREATE INDEX "tv_shows_content_rating_idx" ON "tv_shows"("content_rating");

-- CreateIndex
CREATE INDEX "tv_shows_tv_show_status_idx" ON "tv_shows"("tv_show_status");

-- CreateIndex
CREATE INDEX "tv_shows_created_at_idx" ON "tv_shows"("created_at");

-- CreateIndex
CREATE INDEX "tv_shows_updated_at_idx" ON "tv_shows"("updated_at");

-- CreateIndex
CREATE INDEX "tv_shows_status_release_year_idx" ON "tv_shows"("status", "release_year");

-- CreateIndex
CREATE INDEX "tv_shows_language_country_idx" ON "tv_shows"("language", "country");

-- CreateIndex
CREATE UNIQUE INDEX "tv_seasons_slug_key" ON "tv_seasons"("slug");

-- CreateIndex
CREATE INDEX "tv_seasons_tv_show_id_idx" ON "tv_seasons"("tv_show_id");

-- CreateIndex
CREATE INDEX "tv_seasons_title_idx" ON "tv_seasons"("title");

-- CreateIndex
CREATE INDEX "tv_seasons_release_year_idx" ON "tv_seasons"("release_year");

-- CreateIndex
CREATE INDEX "tv_seasons_language_idx" ON "tv_seasons"("language");

-- CreateIndex
CREATE INDEX "tv_seasons_country_idx" ON "tv_seasons"("country");

-- CreateIndex
CREATE INDEX "tv_seasons_content_rating_idx" ON "tv_seasons"("content_rating");

-- CreateIndex
CREATE INDEX "tv_seasons_created_at_idx" ON "tv_seasons"("created_at");

-- CreateIndex
CREATE INDEX "tv_seasons_updated_at_idx" ON "tv_seasons"("updated_at");

-- CreateIndex
CREATE INDEX "tv_seasons_status_release_year_idx" ON "tv_seasons"("status", "release_year");

-- CreateIndex
CREATE UNIQUE INDEX "tv_seasons_tv_show_id_season_number_key" ON "tv_seasons"("tv_show_id", "season_number");

-- CreateIndex
CREATE UNIQUE INDEX "tv_episodes_slug_key" ON "tv_episodes"("slug");

-- CreateIndex
CREATE INDEX "tv_episodes_tv_season_id_idx" ON "tv_episodes"("tv_season_id");

-- CreateIndex
CREATE INDEX "tv_episodes_title_idx" ON "tv_episodes"("title");

-- CreateIndex
CREATE INDEX "tv_episodes_release_year_idx" ON "tv_episodes"("release_year");

-- CreateIndex
CREATE INDEX "tv_episodes_language_idx" ON "tv_episodes"("language");

-- CreateIndex
CREATE INDEX "tv_episodes_country_idx" ON "tv_episodes"("country");

-- CreateIndex
CREATE INDEX "tv_episodes_status_idx" ON "tv_episodes"("status");

-- CreateIndex
CREATE INDEX "tv_episodes_content_rating_idx" ON "tv_episodes"("content_rating");

-- CreateIndex
CREATE INDEX "tv_episodes_created_at_idx" ON "tv_episodes"("created_at");

-- CreateIndex
CREATE INDEX "tv_episodes_updated_at_idx" ON "tv_episodes"("updated_at");

-- CreateIndex
CREATE UNIQUE INDEX "tv_episodes_tv_season_id_episode_number_key" ON "tv_episodes"("tv_season_id", "episode_number");

-- CreateIndex
CREATE UNIQUE INDEX "anime_slug_key" ON "anime"("slug");

-- CreateIndex
CREATE INDEX "anime_title_idx" ON "anime"("title");

-- CreateIndex
CREATE INDEX "anime_release_year_idx" ON "anime"("release_year");

-- CreateIndex
CREATE INDEX "anime_country_idx" ON "anime"("country");

-- CreateIndex
CREATE INDEX "anime_content_rating_idx" ON "anime"("content_rating");

-- CreateIndex
CREATE INDEX "anime_anime_status_idx" ON "anime"("anime_status");

-- CreateIndex
CREATE INDEX "anime_created_at_idx" ON "anime"("created_at");

-- CreateIndex
CREATE INDEX "anime_updated_at_idx" ON "anime"("updated_at");

-- CreateIndex
CREATE INDEX "anime_status_release_year_idx" ON "anime"("status", "release_year");

-- CreateIndex
CREATE INDEX "anime_language_country_idx" ON "anime"("language", "country");

-- CreateIndex
CREATE UNIQUE INDEX "anime_episodes_slug_key" ON "anime_episodes"("slug");

-- CreateIndex
CREATE INDEX "anime_episodes_anime_id_idx" ON "anime_episodes"("anime_id");

-- CreateIndex
CREATE INDEX "anime_episodes_title_idx" ON "anime_episodes"("title");

-- CreateIndex
CREATE INDEX "anime_episodes_release_year_idx" ON "anime_episodes"("release_year");

-- CreateIndex
CREATE INDEX "anime_episodes_language_idx" ON "anime_episodes"("language");

-- CreateIndex
CREATE INDEX "anime_episodes_country_idx" ON "anime_episodes"("country");

-- CreateIndex
CREATE INDEX "anime_episodes_status_idx" ON "anime_episodes"("status");

-- CreateIndex
CREATE INDEX "anime_episodes_content_rating_idx" ON "anime_episodes"("content_rating");

-- CreateIndex
CREATE INDEX "anime_episodes_created_at_idx" ON "anime_episodes"("created_at");

-- CreateIndex
CREATE INDEX "anime_episodes_updated_at_idx" ON "anime_episodes"("updated_at");

-- CreateIndex
CREATE UNIQUE INDEX "anime_episodes_anime_id_episode_number_key" ON "anime_episodes"("anime_id", "episode_number");

-- CreateIndex
CREATE UNIQUE INDEX "books_slug_key" ON "books"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "books_isbn_key" ON "books"("isbn");

-- CreateIndex
CREATE INDEX "books_title_idx" ON "books"("title");

-- CreateIndex
CREATE INDEX "books_release_year_idx" ON "books"("release_year");

-- CreateIndex
CREATE INDEX "books_country_idx" ON "books"("country");

-- CreateIndex
CREATE INDEX "books_format_idx" ON "books"("format");

-- CreateIndex
CREATE INDEX "books_created_at_idx" ON "books"("created_at");

-- CreateIndex
CREATE INDEX "books_updated_at_idx" ON "books"("updated_at");

-- CreateIndex
CREATE INDEX "books_status_release_year_idx" ON "books"("status", "release_year");

-- CreateIndex
CREATE INDEX "books_language_country_idx" ON "books"("language", "country");

-- CreateIndex
CREATE UNIQUE INDEX "games_slug_key" ON "games"("slug");

-- CreateIndex
CREATE INDEX "games_title_idx" ON "games"("title");

-- CreateIndex
CREATE INDEX "games_release_year_idx" ON "games"("release_year");

-- CreateIndex
CREATE INDEX "games_country_idx" ON "games"("country");

-- CreateIndex
CREATE INDEX "games_content_rating_idx" ON "games"("content_rating");

-- CreateIndex
CREATE INDEX "games_release_status_idx" ON "games"("release_status");

-- CreateIndex
CREATE INDEX "games_platform_idx" ON "games"("platform");

-- CreateIndex
CREATE INDEX "games_created_at_idx" ON "games"("created_at");

-- CreateIndex
CREATE INDEX "games_updated_at_idx" ON "games"("updated_at");

-- CreateIndex
CREATE INDEX "games_status_release_year_idx" ON "games"("status", "release_year");

-- CreateIndex
CREATE INDEX "games_language_country_idx" ON "games"("language", "country");

-- CreateIndex
CREATE UNIQUE INDEX "music_artists_slug_key" ON "music_artists"("slug");

-- CreateIndex
CREATE INDEX "music_artists_title_idx" ON "music_artists"("title");

-- CreateIndex
CREATE INDEX "music_artists_release_year_idx" ON "music_artists"("release_year");

-- CreateIndex
CREATE INDEX "music_artists_country_idx" ON "music_artists"("country");

-- CreateIndex
CREATE INDEX "music_artists_status_idx" ON "music_artists"("status");

-- CreateIndex
CREATE INDEX "music_artists_created_at_idx" ON "music_artists"("created_at");

-- CreateIndex
CREATE INDEX "music_artists_updated_at_idx" ON "music_artists"("updated_at");

-- CreateIndex
CREATE INDEX "music_artists_language_country_idx" ON "music_artists"("language", "country");

-- CreateIndex
CREATE UNIQUE INDEX "music_albums_slug_key" ON "music_albums"("slug");

-- CreateIndex
CREATE INDEX "music_albums_title_idx" ON "music_albums"("title");

-- CreateIndex
CREATE INDEX "music_albums_release_year_idx" ON "music_albums"("release_year");

-- CreateIndex
CREATE INDEX "music_albums_country_idx" ON "music_albums"("country");

-- CreateIndex
CREATE INDEX "music_albums_created_at_idx" ON "music_albums"("created_at");

-- CreateIndex
CREATE INDEX "music_albums_updated_at_idx" ON "music_albums"("updated_at");

-- CreateIndex
CREATE INDEX "music_albums_status_release_year_idx" ON "music_albums"("status", "release_year");

-- CreateIndex
CREATE INDEX "music_albums_language_country_idx" ON "music_albums"("language", "country");

-- CreateIndex
CREATE UNIQUE INDEX "music_tracks_slug_key" ON "music_tracks"("slug");

-- CreateIndex
CREATE INDEX "music_tracks_music_album_id_idx" ON "music_tracks"("music_album_id");

-- CreateIndex
CREATE INDEX "music_tracks_title_idx" ON "music_tracks"("title");

-- CreateIndex
CREATE INDEX "music_tracks_release_year_idx" ON "music_tracks"("release_year");

-- CreateIndex
CREATE INDEX "music_tracks_language_idx" ON "music_tracks"("language");

-- CreateIndex
CREATE INDEX "music_tracks_country_idx" ON "music_tracks"("country");

-- CreateIndex
CREATE INDEX "music_tracks_status_idx" ON "music_tracks"("status");

-- CreateIndex
CREATE INDEX "music_tracks_created_at_idx" ON "music_tracks"("created_at");

-- CreateIndex
CREATE INDEX "music_tracks_updated_at_idx" ON "music_tracks"("updated_at");

-- CreateIndex
CREATE UNIQUE INDEX "music_tracks_music_album_id_track_number_key" ON "music_tracks"("music_album_id", "track_number");

-- CreateIndex
CREATE UNIQUE INDEX "podcasts_slug_key" ON "podcasts"("slug");

-- CreateIndex
CREATE INDEX "podcasts_title_idx" ON "podcasts"("title");

-- CreateIndex
CREATE INDEX "podcasts_release_year_idx" ON "podcasts"("release_year");

-- CreateIndex
CREATE INDEX "podcasts_country_idx" ON "podcasts"("country");

-- CreateIndex
CREATE INDEX "podcasts_podcast_status_idx" ON "podcasts"("podcast_status");

-- CreateIndex
CREATE INDEX "podcasts_created_at_idx" ON "podcasts"("created_at");

-- CreateIndex
CREATE INDEX "podcasts_updated_at_idx" ON "podcasts"("updated_at");

-- CreateIndex
CREATE INDEX "podcasts_status_release_year_idx" ON "podcasts"("status", "release_year");

-- CreateIndex
CREATE INDEX "podcasts_language_country_idx" ON "podcasts"("language", "country");

-- CreateIndex
CREATE UNIQUE INDEX "podcast_episodes_slug_key" ON "podcast_episodes"("slug");

-- CreateIndex
CREATE INDEX "podcast_episodes_podcast_id_idx" ON "podcast_episodes"("podcast_id");

-- CreateIndex
CREATE INDEX "podcast_episodes_title_idx" ON "podcast_episodes"("title");

-- CreateIndex
CREATE INDEX "podcast_episodes_release_year_idx" ON "podcast_episodes"("release_year");

-- CreateIndex
CREATE INDEX "podcast_episodes_language_idx" ON "podcast_episodes"("language");

-- CreateIndex
CREATE INDEX "podcast_episodes_country_idx" ON "podcast_episodes"("country");

-- CreateIndex
CREATE INDEX "podcast_episodes_status_idx" ON "podcast_episodes"("status");

-- CreateIndex
CREATE INDEX "podcast_episodes_created_at_idx" ON "podcast_episodes"("created_at");

-- CreateIndex
CREATE INDEX "podcast_episodes_updated_at_idx" ON "podcast_episodes"("updated_at");

-- CreateIndex
CREATE UNIQUE INDEX "podcast_episodes_podcast_id_episode_number_key" ON "podcast_episodes"("podcast_id", "episode_number");

-- CreateIndex
CREATE UNIQUE INDEX "courses_slug_key" ON "courses"("slug");

-- CreateIndex
CREATE INDEX "courses_title_idx" ON "courses"("title");

-- CreateIndex
CREATE INDEX "courses_release_year_idx" ON "courses"("release_year");

-- CreateIndex
CREATE INDEX "courses_country_idx" ON "courses"("country");

-- CreateIndex
CREATE INDEX "courses_difficulty_idx" ON "courses"("difficulty");

-- CreateIndex
CREATE INDEX "courses_created_at_idx" ON "courses"("created_at");

-- CreateIndex
CREATE INDEX "courses_updated_at_idx" ON "courses"("updated_at");

-- CreateIndex
CREATE INDEX "courses_status_release_year_idx" ON "courses"("status", "release_year");

-- CreateIndex
CREATE INDEX "courses_language_country_idx" ON "courses"("language", "country");

-- CreateIndex
CREATE UNIQUE INDEX "course_modules_slug_key" ON "course_modules"("slug");

-- CreateIndex
CREATE INDEX "course_modules_course_id_idx" ON "course_modules"("course_id");

-- CreateIndex
CREATE INDEX "course_modules_title_idx" ON "course_modules"("title");

-- CreateIndex
CREATE INDEX "course_modules_release_year_idx" ON "course_modules"("release_year");

-- CreateIndex
CREATE INDEX "course_modules_language_idx" ON "course_modules"("language");

-- CreateIndex
CREATE INDEX "course_modules_country_idx" ON "course_modules"("country");

-- CreateIndex
CREATE INDEX "course_modules_created_at_idx" ON "course_modules"("created_at");

-- CreateIndex
CREATE INDEX "course_modules_updated_at_idx" ON "course_modules"("updated_at");

-- CreateIndex
CREATE INDEX "course_modules_status_release_year_idx" ON "course_modules"("status", "release_year");

-- CreateIndex
CREATE UNIQUE INDEX "course_modules_course_id_module_number_key" ON "course_modules"("course_id", "module_number");

-- CreateIndex
CREATE UNIQUE INDEX "course_lessons_slug_key" ON "course_lessons"("slug");

-- CreateIndex
CREATE INDEX "course_lessons_course_module_id_idx" ON "course_lessons"("course_module_id");

-- CreateIndex
CREATE INDEX "course_lessons_title_idx" ON "course_lessons"("title");

-- CreateIndex
CREATE INDEX "course_lessons_release_year_idx" ON "course_lessons"("release_year");

-- CreateIndex
CREATE INDEX "course_lessons_language_idx" ON "course_lessons"("language");

-- CreateIndex
CREATE INDEX "course_lessons_country_idx" ON "course_lessons"("country");

-- CreateIndex
CREATE INDEX "course_lessons_status_idx" ON "course_lessons"("status");

-- CreateIndex
CREATE INDEX "course_lessons_created_at_idx" ON "course_lessons"("created_at");

-- CreateIndex
CREATE INDEX "course_lessons_updated_at_idx" ON "course_lessons"("updated_at");

-- CreateIndex
CREATE UNIQUE INDEX "course_lessons_course_module_id_lesson_number_key" ON "course_lessons"("course_module_id", "lesson_number");

-- CreateIndex
CREATE INDEX "user_movies_movie_id_idx" ON "user_movies"("movie_id");

-- CreateIndex
CREATE INDEX "user_movies_created_at_idx" ON "user_movies"("created_at");

-- CreateIndex
CREATE INDEX "user_movies_updated_at_idx" ON "user_movies"("updated_at");

-- CreateIndex
CREATE INDEX "user_movies_user_id_status_idx" ON "user_movies"("user_id", "status");

-- CreateIndex
CREATE INDEX "user_movies_user_id_favorite_idx" ON "user_movies"("user_id", "favorite");

-- CreateIndex
CREATE INDEX "user_movies_user_id_last_interaction_at_idx" ON "user_movies"("user_id", "last_interaction_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_movies_user_id_movie_id_key" ON "user_movies"("user_id", "movie_id");

-- CreateIndex
CREATE INDEX "user_tv_shows_tv_show_id_idx" ON "user_tv_shows"("tv_show_id");

-- CreateIndex
CREATE INDEX "user_tv_shows_created_at_idx" ON "user_tv_shows"("created_at");

-- CreateIndex
CREATE INDEX "user_tv_shows_updated_at_idx" ON "user_tv_shows"("updated_at");

-- CreateIndex
CREATE INDEX "user_tv_shows_user_id_status_idx" ON "user_tv_shows"("user_id", "status");

-- CreateIndex
CREATE INDEX "user_tv_shows_user_id_favorite_idx" ON "user_tv_shows"("user_id", "favorite");

-- CreateIndex
CREATE INDEX "user_tv_shows_user_id_last_interaction_at_idx" ON "user_tv_shows"("user_id", "last_interaction_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_tv_shows_user_id_tv_show_id_key" ON "user_tv_shows"("user_id", "tv_show_id");

-- CreateIndex
CREATE INDEX "user_tv_seasons_tv_season_id_idx" ON "user_tv_seasons"("tv_season_id");

-- CreateIndex
CREATE INDEX "user_tv_seasons_created_at_idx" ON "user_tv_seasons"("created_at");

-- CreateIndex
CREATE INDEX "user_tv_seasons_updated_at_idx" ON "user_tv_seasons"("updated_at");

-- CreateIndex
CREATE INDEX "user_tv_seasons_user_id_status_idx" ON "user_tv_seasons"("user_id", "status");

-- CreateIndex
CREATE INDEX "user_tv_seasons_user_id_favorite_idx" ON "user_tv_seasons"("user_id", "favorite");

-- CreateIndex
CREATE INDEX "user_tv_seasons_user_id_last_interaction_at_idx" ON "user_tv_seasons"("user_id", "last_interaction_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_tv_seasons_user_id_tv_season_id_key" ON "user_tv_seasons"("user_id", "tv_season_id");

-- CreateIndex
CREATE INDEX "user_tv_episodes_tv_episode_id_idx" ON "user_tv_episodes"("tv_episode_id");

-- CreateIndex
CREATE INDEX "user_tv_episodes_created_at_idx" ON "user_tv_episodes"("created_at");

-- CreateIndex
CREATE INDEX "user_tv_episodes_updated_at_idx" ON "user_tv_episodes"("updated_at");

-- CreateIndex
CREATE INDEX "user_tv_episodes_user_id_status_idx" ON "user_tv_episodes"("user_id", "status");

-- CreateIndex
CREATE INDEX "user_tv_episodes_user_id_favorite_idx" ON "user_tv_episodes"("user_id", "favorite");

-- CreateIndex
CREATE INDEX "user_tv_episodes_user_id_last_interaction_at_idx" ON "user_tv_episodes"("user_id", "last_interaction_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_tv_episodes_user_id_tv_episode_id_key" ON "user_tv_episodes"("user_id", "tv_episode_id");

-- CreateIndex
CREATE INDEX "user_anime_anime_id_idx" ON "user_anime"("anime_id");

-- CreateIndex
CREATE INDEX "user_anime_created_at_idx" ON "user_anime"("created_at");

-- CreateIndex
CREATE INDEX "user_anime_updated_at_idx" ON "user_anime"("updated_at");

-- CreateIndex
CREATE INDEX "user_anime_user_id_status_idx" ON "user_anime"("user_id", "status");

-- CreateIndex
CREATE INDEX "user_anime_user_id_favorite_idx" ON "user_anime"("user_id", "favorite");

-- CreateIndex
CREATE INDEX "user_anime_user_id_last_interaction_at_idx" ON "user_anime"("user_id", "last_interaction_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_anime_user_id_anime_id_key" ON "user_anime"("user_id", "anime_id");

-- CreateIndex
CREATE INDEX "user_anime_episodes_anime_episode_id_idx" ON "user_anime_episodes"("anime_episode_id");

-- CreateIndex
CREATE INDEX "user_anime_episodes_created_at_idx" ON "user_anime_episodes"("created_at");

-- CreateIndex
CREATE INDEX "user_anime_episodes_updated_at_idx" ON "user_anime_episodes"("updated_at");

-- CreateIndex
CREATE INDEX "user_anime_episodes_user_id_status_idx" ON "user_anime_episodes"("user_id", "status");

-- CreateIndex
CREATE INDEX "user_anime_episodes_user_id_favorite_idx" ON "user_anime_episodes"("user_id", "favorite");

-- CreateIndex
CREATE INDEX "user_anime_episodes_user_id_last_interaction_at_idx" ON "user_anime_episodes"("user_id", "last_interaction_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_anime_episodes_user_id_anime_episode_id_key" ON "user_anime_episodes"("user_id", "anime_episode_id");

-- CreateIndex
CREATE INDEX "user_books_book_id_idx" ON "user_books"("book_id");

-- CreateIndex
CREATE INDEX "user_books_created_at_idx" ON "user_books"("created_at");

-- CreateIndex
CREATE INDEX "user_books_updated_at_idx" ON "user_books"("updated_at");

-- CreateIndex
CREATE INDEX "user_books_user_id_status_idx" ON "user_books"("user_id", "status");

-- CreateIndex
CREATE INDEX "user_books_user_id_favorite_idx" ON "user_books"("user_id", "favorite");

-- CreateIndex
CREATE INDEX "user_books_user_id_last_interaction_at_idx" ON "user_books"("user_id", "last_interaction_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_books_user_id_book_id_key" ON "user_books"("user_id", "book_id");

-- CreateIndex
CREATE INDEX "user_games_game_id_idx" ON "user_games"("game_id");

-- CreateIndex
CREATE INDEX "user_games_created_at_idx" ON "user_games"("created_at");

-- CreateIndex
CREATE INDEX "user_games_updated_at_idx" ON "user_games"("updated_at");

-- CreateIndex
CREATE INDEX "user_games_user_id_status_idx" ON "user_games"("user_id", "status");

-- CreateIndex
CREATE INDEX "user_games_user_id_favorite_idx" ON "user_games"("user_id", "favorite");

-- CreateIndex
CREATE INDEX "user_games_user_id_last_interaction_at_idx" ON "user_games"("user_id", "last_interaction_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_games_user_id_game_id_key" ON "user_games"("user_id", "game_id");

-- CreateIndex
CREATE INDEX "user_music_albums_music_album_id_idx" ON "user_music_albums"("music_album_id");

-- CreateIndex
CREATE INDEX "user_music_albums_created_at_idx" ON "user_music_albums"("created_at");

-- CreateIndex
CREATE INDEX "user_music_albums_updated_at_idx" ON "user_music_albums"("updated_at");

-- CreateIndex
CREATE INDEX "user_music_albums_user_id_status_idx" ON "user_music_albums"("user_id", "status");

-- CreateIndex
CREATE INDEX "user_music_albums_user_id_favorite_idx" ON "user_music_albums"("user_id", "favorite");

-- CreateIndex
CREATE INDEX "user_music_albums_user_id_last_interaction_at_idx" ON "user_music_albums"("user_id", "last_interaction_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_music_albums_user_id_music_album_id_key" ON "user_music_albums"("user_id", "music_album_id");

-- CreateIndex
CREATE INDEX "user_music_tracks_music_track_id_idx" ON "user_music_tracks"("music_track_id");

-- CreateIndex
CREATE INDEX "user_music_tracks_created_at_idx" ON "user_music_tracks"("created_at");

-- CreateIndex
CREATE INDEX "user_music_tracks_updated_at_idx" ON "user_music_tracks"("updated_at");

-- CreateIndex
CREATE INDEX "user_music_tracks_user_id_status_idx" ON "user_music_tracks"("user_id", "status");

-- CreateIndex
CREATE INDEX "user_music_tracks_user_id_favorite_idx" ON "user_music_tracks"("user_id", "favorite");

-- CreateIndex
CREATE INDEX "user_music_tracks_user_id_last_interaction_at_idx" ON "user_music_tracks"("user_id", "last_interaction_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_music_tracks_user_id_music_track_id_key" ON "user_music_tracks"("user_id", "music_track_id");

-- CreateIndex
CREATE INDEX "user_podcasts_podcast_id_idx" ON "user_podcasts"("podcast_id");

-- CreateIndex
CREATE INDEX "user_podcasts_created_at_idx" ON "user_podcasts"("created_at");

-- CreateIndex
CREATE INDEX "user_podcasts_updated_at_idx" ON "user_podcasts"("updated_at");

-- CreateIndex
CREATE INDEX "user_podcasts_user_id_status_idx" ON "user_podcasts"("user_id", "status");

-- CreateIndex
CREATE INDEX "user_podcasts_user_id_favorite_idx" ON "user_podcasts"("user_id", "favorite");

-- CreateIndex
CREATE INDEX "user_podcasts_user_id_last_interaction_at_idx" ON "user_podcasts"("user_id", "last_interaction_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_podcasts_user_id_podcast_id_key" ON "user_podcasts"("user_id", "podcast_id");

-- CreateIndex
CREATE INDEX "user_podcast_episodes_podcast_episode_id_idx" ON "user_podcast_episodes"("podcast_episode_id");

-- CreateIndex
CREATE INDEX "user_podcast_episodes_created_at_idx" ON "user_podcast_episodes"("created_at");

-- CreateIndex
CREATE INDEX "user_podcast_episodes_updated_at_idx" ON "user_podcast_episodes"("updated_at");

-- CreateIndex
CREATE INDEX "user_podcast_episodes_user_id_status_idx" ON "user_podcast_episodes"("user_id", "status");

-- CreateIndex
CREATE INDEX "user_podcast_episodes_user_id_favorite_idx" ON "user_podcast_episodes"("user_id", "favorite");

-- CreateIndex
CREATE INDEX "user_podcast_episodes_user_id_last_interaction_at_idx" ON "user_podcast_episodes"("user_id", "last_interaction_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_podcast_episodes_user_id_podcast_episode_id_key" ON "user_podcast_episodes"("user_id", "podcast_episode_id");

-- CreateIndex
CREATE INDEX "user_courses_course_id_idx" ON "user_courses"("course_id");

-- CreateIndex
CREATE INDEX "user_courses_created_at_idx" ON "user_courses"("created_at");

-- CreateIndex
CREATE INDEX "user_courses_updated_at_idx" ON "user_courses"("updated_at");

-- CreateIndex
CREATE INDEX "user_courses_user_id_status_idx" ON "user_courses"("user_id", "status");

-- CreateIndex
CREATE INDEX "user_courses_user_id_favorite_idx" ON "user_courses"("user_id", "favorite");

-- CreateIndex
CREATE INDEX "user_courses_user_id_last_interaction_at_idx" ON "user_courses"("user_id", "last_interaction_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_courses_user_id_course_id_key" ON "user_courses"("user_id", "course_id");

-- CreateIndex
CREATE INDEX "user_course_modules_course_module_id_idx" ON "user_course_modules"("course_module_id");

-- CreateIndex
CREATE INDEX "user_course_modules_created_at_idx" ON "user_course_modules"("created_at");

-- CreateIndex
CREATE INDEX "user_course_modules_updated_at_idx" ON "user_course_modules"("updated_at");

-- CreateIndex
CREATE INDEX "user_course_modules_user_id_status_idx" ON "user_course_modules"("user_id", "status");

-- CreateIndex
CREATE INDEX "user_course_modules_user_id_favorite_idx" ON "user_course_modules"("user_id", "favorite");

-- CreateIndex
CREATE INDEX "user_course_modules_user_id_last_interaction_at_idx" ON "user_course_modules"("user_id", "last_interaction_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_course_modules_user_id_course_module_id_key" ON "user_course_modules"("user_id", "course_module_id");

-- CreateIndex
CREATE INDEX "user_course_lessons_course_lesson_id_idx" ON "user_course_lessons"("course_lesson_id");

-- CreateIndex
CREATE INDEX "user_course_lessons_created_at_idx" ON "user_course_lessons"("created_at");

-- CreateIndex
CREATE INDEX "user_course_lessons_updated_at_idx" ON "user_course_lessons"("updated_at");

-- CreateIndex
CREATE INDEX "user_course_lessons_user_id_status_idx" ON "user_course_lessons"("user_id", "status");

-- CreateIndex
CREATE INDEX "user_course_lessons_user_id_favorite_idx" ON "user_course_lessons"("user_id", "favorite");

-- CreateIndex
CREATE INDEX "user_course_lessons_user_id_last_interaction_at_idx" ON "user_course_lessons"("user_id", "last_interaction_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_course_lessons_user_id_course_lesson_id_key" ON "user_course_lessons"("user_id", "course_lesson_id");

-- CreateIndex
CREATE INDEX "collections_slug_idx" ON "collections"("slug");

-- CreateIndex
CREATE INDEX "collections_visibility_idx" ON "collections"("visibility");

-- CreateIndex
CREATE INDEX "collections_sort_order_idx" ON "collections"("sort_order");

-- CreateIndex
CREATE INDEX "collections_created_at_idx" ON "collections"("created_at");

-- CreateIndex
CREATE INDEX "collections_updated_at_idx" ON "collections"("updated_at");

-- CreateIndex
CREATE INDEX "collections_user_id_visibility_idx" ON "collections"("user_id", "visibility");

-- CreateIndex
CREATE UNIQUE INDEX "collections_user_id_slug_key" ON "collections"("user_id", "slug");

-- CreateIndex
CREATE INDEX "collection_items_movie_id_idx" ON "collection_items"("movie_id");

-- CreateIndex
CREATE INDEX "collection_items_tv_show_id_idx" ON "collection_items"("tv_show_id");

-- CreateIndex
CREATE INDEX "collection_items_anime_id_idx" ON "collection_items"("anime_id");

-- CreateIndex
CREATE INDEX "collection_items_book_id_idx" ON "collection_items"("book_id");

-- CreateIndex
CREATE INDEX "collection_items_game_id_idx" ON "collection_items"("game_id");

-- CreateIndex
CREATE INDEX "collection_items_music_album_id_idx" ON "collection_items"("music_album_id");

-- CreateIndex
CREATE INDEX "collection_items_podcast_id_idx" ON "collection_items"("podcast_id");

-- CreateIndex
CREATE INDEX "collection_items_course_id_idx" ON "collection_items"("course_id");

-- CreateIndex
CREATE INDEX "collection_items_position_idx" ON "collection_items"("position");

-- CreateIndex
CREATE INDEX "collection_items_added_at_idx" ON "collection_items"("added_at");

-- CreateIndex
CREATE INDEX "collection_items_collection_id_position_idx" ON "collection_items"("collection_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "collection_items_collection_id_movie_id_key" ON "collection_items"("collection_id", "movie_id");

-- CreateIndex
CREATE UNIQUE INDEX "collection_items_collection_id_tv_show_id_key" ON "collection_items"("collection_id", "tv_show_id");

-- CreateIndex
CREATE UNIQUE INDEX "collection_items_collection_id_anime_id_key" ON "collection_items"("collection_id", "anime_id");

-- CreateIndex
CREATE UNIQUE INDEX "collection_items_collection_id_book_id_key" ON "collection_items"("collection_id", "book_id");

-- CreateIndex
CREATE UNIQUE INDEX "collection_items_collection_id_game_id_key" ON "collection_items"("collection_id", "game_id");

-- CreateIndex
CREATE UNIQUE INDEX "collection_items_collection_id_music_album_id_key" ON "collection_items"("collection_id", "music_album_id");

-- CreateIndex
CREATE UNIQUE INDEX "collection_items_collection_id_podcast_id_key" ON "collection_items"("collection_id", "podcast_id");

-- CreateIndex
CREATE UNIQUE INDEX "collection_items_collection_id_course_id_key" ON "collection_items"("collection_id", "course_id");

-- CreateIndex
CREATE INDEX "shelves_slug_idx" ON "shelves"("slug");

-- CreateIndex
CREATE INDEX "shelves_visibility_idx" ON "shelves"("visibility");

-- CreateIndex
CREATE INDEX "shelves_sort_order_idx" ON "shelves"("sort_order");

-- CreateIndex
CREATE INDEX "shelves_created_at_idx" ON "shelves"("created_at");

-- CreateIndex
CREATE INDEX "shelves_updated_at_idx" ON "shelves"("updated_at");

-- CreateIndex
CREATE INDEX "shelves_user_id_visibility_idx" ON "shelves"("user_id", "visibility");

-- CreateIndex
CREATE UNIQUE INDEX "shelves_user_id_slug_key" ON "shelves"("user_id", "slug");

-- CreateIndex
CREATE INDEX "shelf_items_movie_id_idx" ON "shelf_items"("movie_id");

-- CreateIndex
CREATE INDEX "shelf_items_tv_show_id_idx" ON "shelf_items"("tv_show_id");

-- CreateIndex
CREATE INDEX "shelf_items_anime_id_idx" ON "shelf_items"("anime_id");

-- CreateIndex
CREATE INDEX "shelf_items_book_id_idx" ON "shelf_items"("book_id");

-- CreateIndex
CREATE INDEX "shelf_items_game_id_idx" ON "shelf_items"("game_id");

-- CreateIndex
CREATE INDEX "shelf_items_music_album_id_idx" ON "shelf_items"("music_album_id");

-- CreateIndex
CREATE INDEX "shelf_items_podcast_id_idx" ON "shelf_items"("podcast_id");

-- CreateIndex
CREATE INDEX "shelf_items_course_id_idx" ON "shelf_items"("course_id");

-- CreateIndex
CREATE INDEX "shelf_items_position_idx" ON "shelf_items"("position");

-- CreateIndex
CREATE INDEX "shelf_items_added_at_idx" ON "shelf_items"("added_at");

-- CreateIndex
CREATE INDEX "shelf_items_shelf_id_position_idx" ON "shelf_items"("shelf_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "shelf_items_shelf_id_movie_id_key" ON "shelf_items"("shelf_id", "movie_id");

-- CreateIndex
CREATE UNIQUE INDEX "shelf_items_shelf_id_tv_show_id_key" ON "shelf_items"("shelf_id", "tv_show_id");

-- CreateIndex
CREATE UNIQUE INDEX "shelf_items_shelf_id_anime_id_key" ON "shelf_items"("shelf_id", "anime_id");

-- CreateIndex
CREATE UNIQUE INDEX "shelf_items_shelf_id_book_id_key" ON "shelf_items"("shelf_id", "book_id");

-- CreateIndex
CREATE UNIQUE INDEX "shelf_items_shelf_id_game_id_key" ON "shelf_items"("shelf_id", "game_id");

-- CreateIndex
CREATE UNIQUE INDEX "shelf_items_shelf_id_music_album_id_key" ON "shelf_items"("shelf_id", "music_album_id");

-- CreateIndex
CREATE UNIQUE INDEX "shelf_items_shelf_id_podcast_id_key" ON "shelf_items"("shelf_id", "podcast_id");

-- CreateIndex
CREATE UNIQUE INDEX "shelf_items_shelf_id_course_id_key" ON "shelf_items"("shelf_id", "course_id");

-- CreateIndex
CREATE INDEX "custom_lists_visibility_idx" ON "custom_lists"("visibility");

-- CreateIndex
CREATE INDEX "custom_lists_created_at_idx" ON "custom_lists"("created_at");

-- CreateIndex
CREATE INDEX "custom_lists_updated_at_idx" ON "custom_lists"("updated_at");

-- CreateIndex
CREATE INDEX "custom_lists_user_id_visibility_idx" ON "custom_lists"("user_id", "visibility");

-- CreateIndex
CREATE INDEX "custom_list_items_movie_id_idx" ON "custom_list_items"("movie_id");

-- CreateIndex
CREATE INDEX "custom_list_items_tv_show_id_idx" ON "custom_list_items"("tv_show_id");

-- CreateIndex
CREATE INDEX "custom_list_items_anime_id_idx" ON "custom_list_items"("anime_id");

-- CreateIndex
CREATE INDEX "custom_list_items_book_id_idx" ON "custom_list_items"("book_id");

-- CreateIndex
CREATE INDEX "custom_list_items_game_id_idx" ON "custom_list_items"("game_id");

-- CreateIndex
CREATE INDEX "custom_list_items_music_album_id_idx" ON "custom_list_items"("music_album_id");

-- CreateIndex
CREATE INDEX "custom_list_items_podcast_id_idx" ON "custom_list_items"("podcast_id");

-- CreateIndex
CREATE INDEX "custom_list_items_course_id_idx" ON "custom_list_items"("course_id");

-- CreateIndex
CREATE INDEX "custom_list_items_position_idx" ON "custom_list_items"("position");

-- CreateIndex
CREATE INDEX "custom_list_items_added_at_idx" ON "custom_list_items"("added_at");

-- CreateIndex
CREATE INDEX "custom_list_items_custom_list_id_position_idx" ON "custom_list_items"("custom_list_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "custom_list_items_custom_list_id_movie_id_key" ON "custom_list_items"("custom_list_id", "movie_id");

-- CreateIndex
CREATE UNIQUE INDEX "custom_list_items_custom_list_id_tv_show_id_key" ON "custom_list_items"("custom_list_id", "tv_show_id");

-- CreateIndex
CREATE UNIQUE INDEX "custom_list_items_custom_list_id_anime_id_key" ON "custom_list_items"("custom_list_id", "anime_id");

-- CreateIndex
CREATE UNIQUE INDEX "custom_list_items_custom_list_id_book_id_key" ON "custom_list_items"("custom_list_id", "book_id");

-- CreateIndex
CREATE UNIQUE INDEX "custom_list_items_custom_list_id_game_id_key" ON "custom_list_items"("custom_list_id", "game_id");

-- CreateIndex
CREATE UNIQUE INDEX "custom_list_items_custom_list_id_music_album_id_key" ON "custom_list_items"("custom_list_id", "music_album_id");

-- CreateIndex
CREATE UNIQUE INDEX "custom_list_items_custom_list_id_podcast_id_key" ON "custom_list_items"("custom_list_id", "podcast_id");

-- CreateIndex
CREATE UNIQUE INDEX "custom_list_items_custom_list_id_course_id_key" ON "custom_list_items"("custom_list_id", "course_id");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");

-- CreateIndex
CREATE INDEX "tags_slug_idx" ON "tags"("slug");

-- CreateIndex
CREATE INDEX "tags_created_at_idx" ON "tags"("created_at");

-- CreateIndex
CREATE INDEX "tags_updated_at_idx" ON "tags"("updated_at");

-- CreateIndex
CREATE INDEX "user_tags_user_id_idx" ON "user_tags"("user_id");

-- CreateIndex
CREATE INDEX "user_tags_slug_idx" ON "user_tags"("slug");

-- CreateIndex
CREATE INDEX "user_tags_created_at_idx" ON "user_tags"("created_at");

-- CreateIndex
CREATE INDEX "user_tags_updated_at_idx" ON "user_tags"("updated_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_tags_user_id_slug_key" ON "user_tags"("user_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "user_tags_user_id_name_key" ON "user_tags"("user_id", "name");

-- CreateIndex
CREATE INDEX "media_tags_tag_id_idx" ON "media_tags"("tag_id");

-- CreateIndex
CREATE INDEX "media_tags_user_tag_id_idx" ON "media_tags"("user_tag_id");

-- CreateIndex
CREATE INDEX "media_tags_movie_id_idx" ON "media_tags"("movie_id");

-- CreateIndex
CREATE INDEX "media_tags_tv_show_id_idx" ON "media_tags"("tv_show_id");

-- CreateIndex
CREATE INDEX "media_tags_anime_id_idx" ON "media_tags"("anime_id");

-- CreateIndex
CREATE INDEX "media_tags_book_id_idx" ON "media_tags"("book_id");

-- CreateIndex
CREATE INDEX "media_tags_game_id_idx" ON "media_tags"("game_id");

-- CreateIndex
CREATE INDEX "media_tags_music_album_id_idx" ON "media_tags"("music_album_id");

-- CreateIndex
CREATE INDEX "media_tags_podcast_id_idx" ON "media_tags"("podcast_id");

-- CreateIndex
CREATE INDEX "media_tags_course_id_idx" ON "media_tags"("course_id");

-- CreateIndex
CREATE INDEX "media_tags_created_at_idx" ON "media_tags"("created_at");

-- CreateIndex
CREATE INDEX "media_tags_updated_at_idx" ON "media_tags"("updated_at");

-- CreateIndex
CREATE UNIQUE INDEX "media_tags_tag_id_movie_id_key" ON "media_tags"("tag_id", "movie_id");

-- CreateIndex
CREATE UNIQUE INDEX "media_tags_tag_id_tv_show_id_key" ON "media_tags"("tag_id", "tv_show_id");

-- CreateIndex
CREATE UNIQUE INDEX "media_tags_tag_id_anime_id_key" ON "media_tags"("tag_id", "anime_id");

-- CreateIndex
CREATE UNIQUE INDEX "media_tags_tag_id_book_id_key" ON "media_tags"("tag_id", "book_id");

-- CreateIndex
CREATE UNIQUE INDEX "media_tags_tag_id_game_id_key" ON "media_tags"("tag_id", "game_id");

-- CreateIndex
CREATE UNIQUE INDEX "media_tags_tag_id_music_album_id_key" ON "media_tags"("tag_id", "music_album_id");

-- CreateIndex
CREATE UNIQUE INDEX "media_tags_tag_id_podcast_id_key" ON "media_tags"("tag_id", "podcast_id");

-- CreateIndex
CREATE UNIQUE INDEX "media_tags_tag_id_course_id_key" ON "media_tags"("tag_id", "course_id");

-- CreateIndex
CREATE UNIQUE INDEX "media_tags_user_tag_id_movie_id_key" ON "media_tags"("user_tag_id", "movie_id");

-- CreateIndex
CREATE UNIQUE INDEX "media_tags_user_tag_id_tv_show_id_key" ON "media_tags"("user_tag_id", "tv_show_id");

-- CreateIndex
CREATE UNIQUE INDEX "media_tags_user_tag_id_anime_id_key" ON "media_tags"("user_tag_id", "anime_id");

-- CreateIndex
CREATE UNIQUE INDEX "media_tags_user_tag_id_book_id_key" ON "media_tags"("user_tag_id", "book_id");

-- CreateIndex
CREATE UNIQUE INDEX "media_tags_user_tag_id_game_id_key" ON "media_tags"("user_tag_id", "game_id");

-- CreateIndex
CREATE UNIQUE INDEX "media_tags_user_tag_id_music_album_id_key" ON "media_tags"("user_tag_id", "music_album_id");

-- CreateIndex
CREATE UNIQUE INDEX "media_tags_user_tag_id_podcast_id_key" ON "media_tags"("user_tag_id", "podcast_id");

-- CreateIndex
CREATE UNIQUE INDEX "media_tags_user_tag_id_course_id_key" ON "media_tags"("user_tag_id", "course_id");

-- CreateIndex
CREATE INDEX "journal_entries_created_at_idx" ON "journal_entries"("created_at");

-- CreateIndex
CREATE INDEX "journal_entries_updated_at_idx" ON "journal_entries"("updated_at");

-- CreateIndex
CREATE INDEX "journal_entries_mood_idx" ON "journal_entries"("mood");

-- CreateIndex
CREATE INDEX "journal_entries_user_id_created_at_idx" ON "journal_entries"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "memories_created_at_idx" ON "memories"("created_at");

-- CreateIndex
CREATE INDEX "memories_updated_at_idx" ON "memories"("updated_at");

-- CreateIndex
CREATE INDEX "memories_memory_date_idx" ON "memories"("memory_date");

-- CreateIndex
CREATE INDEX "memories_user_id_memory_date_idx" ON "memories"("user_id", "memory_date");

-- CreateIndex
CREATE INDEX "memory_media_movie_id_idx" ON "memory_media"("movie_id");

-- CreateIndex
CREATE INDEX "memory_media_tv_show_id_idx" ON "memory_media"("tv_show_id");

-- CreateIndex
CREATE INDEX "memory_media_anime_id_idx" ON "memory_media"("anime_id");

-- CreateIndex
CREATE INDEX "memory_media_book_id_idx" ON "memory_media"("book_id");

-- CreateIndex
CREATE INDEX "memory_media_game_id_idx" ON "memory_media"("game_id");

-- CreateIndex
CREATE INDEX "memory_media_music_album_id_idx" ON "memory_media"("music_album_id");

-- CreateIndex
CREATE INDEX "memory_media_podcast_id_idx" ON "memory_media"("podcast_id");

-- CreateIndex
CREATE INDEX "memory_media_course_id_idx" ON "memory_media"("course_id");

-- CreateIndex
CREATE INDEX "memory_media_position_idx" ON "memory_media"("position");

-- CreateIndex
CREATE INDEX "memory_media_added_at_idx" ON "memory_media"("added_at");

-- CreateIndex
CREATE INDEX "memory_media_memory_id_position_idx" ON "memory_media"("memory_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "memory_media_memory_id_movie_id_key" ON "memory_media"("memory_id", "movie_id");

-- CreateIndex
CREATE UNIQUE INDEX "memory_media_memory_id_tv_show_id_key" ON "memory_media"("memory_id", "tv_show_id");

-- CreateIndex
CREATE UNIQUE INDEX "memory_media_memory_id_anime_id_key" ON "memory_media"("memory_id", "anime_id");

-- CreateIndex
CREATE UNIQUE INDEX "memory_media_memory_id_book_id_key" ON "memory_media"("memory_id", "book_id");

-- CreateIndex
CREATE UNIQUE INDEX "memory_media_memory_id_game_id_key" ON "memory_media"("memory_id", "game_id");

-- CreateIndex
CREATE UNIQUE INDEX "memory_media_memory_id_music_album_id_key" ON "memory_media"("memory_id", "music_album_id");

-- CreateIndex
CREATE UNIQUE INDEX "memory_media_memory_id_podcast_id_key" ON "memory_media"("memory_id", "podcast_id");

-- CreateIndex
CREATE UNIQUE INDEX "memory_media_memory_id_course_id_key" ON "memory_media"("memory_id", "course_id");

-- CreateIndex
CREATE INDEX "timeline_events_created_at_idx" ON "timeline_events"("created_at");

-- CreateIndex
CREATE INDEX "timeline_events_event_date_idx" ON "timeline_events"("event_date");

-- CreateIndex
CREATE INDEX "timeline_events_type_idx" ON "timeline_events"("type");

-- CreateIndex
CREATE INDEX "timeline_events_user_id_created_at_idx" ON "timeline_events"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "timeline_events_user_id_event_date_idx" ON "timeline_events"("user_id", "event_date");

-- CreateIndex
CREATE INDEX "favorite_quotes_user_id_idx" ON "favorite_quotes"("user_id");

-- CreateIndex
CREATE INDEX "favorite_quotes_movie_id_idx" ON "favorite_quotes"("movie_id");

-- CreateIndex
CREATE INDEX "favorite_quotes_tv_show_id_idx" ON "favorite_quotes"("tv_show_id");

-- CreateIndex
CREATE INDEX "favorite_quotes_anime_id_idx" ON "favorite_quotes"("anime_id");

-- CreateIndex
CREATE INDEX "favorite_quotes_book_id_idx" ON "favorite_quotes"("book_id");

-- CreateIndex
CREATE INDEX "favorite_quotes_game_id_idx" ON "favorite_quotes"("game_id");

-- CreateIndex
CREATE INDEX "favorite_quotes_podcast_id_idx" ON "favorite_quotes"("podcast_id");

-- CreateIndex
CREATE INDEX "favorite_quotes_course_id_idx" ON "favorite_quotes"("course_id");

-- CreateIndex
CREATE INDEX "favorite_quotes_created_at_idx" ON "favorite_quotes"("created_at");

-- CreateIndex
CREATE INDEX "favorite_quotes_updated_at_idx" ON "favorite_quotes"("updated_at");

-- CreateIndex
CREATE INDEX "highlights_user_id_idx" ON "highlights"("user_id");

-- CreateIndex
CREATE INDEX "highlights_movie_id_idx" ON "highlights"("movie_id");

-- CreateIndex
CREATE INDEX "highlights_tv_show_id_idx" ON "highlights"("tv_show_id");

-- CreateIndex
CREATE INDEX "highlights_anime_id_idx" ON "highlights"("anime_id");

-- CreateIndex
CREATE INDEX "highlights_book_id_idx" ON "highlights"("book_id");

-- CreateIndex
CREATE INDEX "highlights_game_id_idx" ON "highlights"("game_id");

-- CreateIndex
CREATE INDEX "highlights_music_album_id_idx" ON "highlights"("music_album_id");

-- CreateIndex
CREATE INDEX "highlights_podcast_id_idx" ON "highlights"("podcast_id");

-- CreateIndex
CREATE INDEX "highlights_course_id_idx" ON "highlights"("course_id");

-- CreateIndex
CREATE INDEX "highlights_created_at_idx" ON "highlights"("created_at");

-- CreateIndex
CREATE INDEX "highlights_updated_at_idx" ON "highlights"("updated_at");

-- CreateIndex
CREATE INDEX "search_histories_searched_at_idx" ON "search_histories"("searched_at");

-- CreateIndex
CREATE INDEX "search_histories_user_id_searched_at_idx" ON "search_histories"("user_id", "searched_at");

-- CreateIndex
CREATE INDEX "saved_searches_created_at_idx" ON "saved_searches"("created_at");

-- CreateIndex
CREATE INDEX "saved_searches_updated_at_idx" ON "saved_searches"("updated_at");

-- CreateIndex
CREATE INDEX "saved_searches_user_id_created_at_idx" ON "saved_searches"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "notifications"("type");

-- CreateIndex
CREATE INDEX "notifications_user_id_created_at_idx" ON "notifications"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "notifications_user_id_type_idx" ON "notifications"("user_id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_user_id_key" ON "notification_preferences"("user_id");

-- CreateIndex
CREATE INDEX "notification_preferences_created_at_idx" ON "notification_preferences"("created_at");

-- CreateIndex
CREATE INDEX "notification_preferences_updated_at_idx" ON "notification_preferences"("updated_at");

-- CreateIndex
CREATE INDEX "activity_feed_created_at_idx" ON "activity_feed"("created_at");

-- CreateIndex
CREATE INDEX "activity_feed_type_idx" ON "activity_feed"("type");

-- CreateIndex
CREATE INDEX "activity_feed_user_id_created_at_idx" ON "activity_feed"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "activity_feed_user_id_type_idx" ON "activity_feed"("user_id", "type");

-- CreateIndex
CREATE INDEX "recommendations_movie_id_idx" ON "recommendations"("movie_id");

-- CreateIndex
CREATE INDEX "recommendations_tv_show_id_idx" ON "recommendations"("tv_show_id");

-- CreateIndex
CREATE INDEX "recommendations_anime_id_idx" ON "recommendations"("anime_id");

-- CreateIndex
CREATE INDEX "recommendations_book_id_idx" ON "recommendations"("book_id");

-- CreateIndex
CREATE INDEX "recommendations_game_id_idx" ON "recommendations"("game_id");

-- CreateIndex
CREATE INDEX "recommendations_music_album_id_idx" ON "recommendations"("music_album_id");

-- CreateIndex
CREATE INDEX "recommendations_podcast_id_idx" ON "recommendations"("podcast_id");

-- CreateIndex
CREATE INDEX "recommendations_course_id_idx" ON "recommendations"("course_id");

-- CreateIndex
CREATE INDEX "recommendations_created_at_idx" ON "recommendations"("created_at");

-- CreateIndex
CREATE INDEX "recommendations_updated_at_idx" ON "recommendations"("updated_at");

-- CreateIndex
CREATE INDEX "recommendations_score_idx" ON "recommendations"("score");

-- CreateIndex
CREATE INDEX "recommendations_user_id_created_at_idx" ON "recommendations"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "recommendations_user_id_movie_id_key" ON "recommendations"("user_id", "movie_id");

-- CreateIndex
CREATE UNIQUE INDEX "recommendations_user_id_tv_show_id_key" ON "recommendations"("user_id", "tv_show_id");

-- CreateIndex
CREATE UNIQUE INDEX "recommendations_user_id_anime_id_key" ON "recommendations"("user_id", "anime_id");

-- CreateIndex
CREATE UNIQUE INDEX "recommendations_user_id_book_id_key" ON "recommendations"("user_id", "book_id");

-- CreateIndex
CREATE UNIQUE INDEX "recommendations_user_id_game_id_key" ON "recommendations"("user_id", "game_id");

-- CreateIndex
CREATE UNIQUE INDEX "recommendations_user_id_music_album_id_key" ON "recommendations"("user_id", "music_album_id");

-- CreateIndex
CREATE UNIQUE INDEX "recommendations_user_id_podcast_id_key" ON "recommendations"("user_id", "podcast_id");

-- CreateIndex
CREATE UNIQUE INDEX "recommendations_user_id_course_id_key" ON "recommendations"("user_id", "course_id");

-- CreateIndex
CREATE INDEX "wrapped_years_year_idx" ON "wrapped_years"("year");

-- CreateIndex
CREATE INDEX "wrapped_years_generated_at_idx" ON "wrapped_years"("generated_at");

-- CreateIndex
CREATE UNIQUE INDEX "wrapped_years_user_id_year_key" ON "wrapped_years"("user_id", "year");

-- CreateIndex
CREATE INDEX "wrapped_stats_sort_order_idx" ON "wrapped_stats"("sort_order");

-- CreateIndex
CREATE INDEX "wrapped_stats_wrapped_year_id_sort_order_idx" ON "wrapped_stats"("wrapped_year_id", "sort_order");

-- CreateIndex
CREATE INDEX "analytics_snapshots_snapshot_date_idx" ON "analytics_snapshots"("snapshot_date");

-- CreateIndex
CREATE INDEX "analytics_snapshots_created_at_idx" ON "analytics_snapshots"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_snapshots_user_id_snapshot_date_key" ON "analytics_snapshots"("user_id", "snapshot_date");

-- CreateIndex
CREATE INDEX "device_sessions_user_id_idx" ON "device_sessions"("user_id");

-- CreateIndex
CREATE INDEX "device_sessions_last_seen_idx" ON "device_sessions"("last_seen");

-- CreateIndex
CREATE INDEX "device_sessions_expires_at_idx" ON "device_sessions"("expires_at");

-- CreateIndex
CREATE INDEX "device_sessions_created_at_idx" ON "device_sessions"("created_at");

-- CreateIndex
CREATE INDEX "_MusicAlbumToMusicArtist_B_index" ON "_MusicAlbumToMusicArtist"("B");

-- AddForeignKey
ALTER TABLE "oauth_accounts" ADD CONSTRAINT "oauth_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_verification_tokens" ADD CONSTRAINT "email_verification_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "security_events" ADD CONSTRAINT "security_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tv_seasons" ADD CONSTRAINT "tv_seasons_tv_show_id_fkey" FOREIGN KEY ("tv_show_id") REFERENCES "tv_shows"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tv_episodes" ADD CONSTRAINT "tv_episodes_tv_season_id_fkey" FOREIGN KEY ("tv_season_id") REFERENCES "tv_seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anime_episodes" ADD CONSTRAINT "anime_episodes_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "anime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "music_tracks" ADD CONSTRAINT "music_tracks_music_album_id_fkey" FOREIGN KEY ("music_album_id") REFERENCES "music_albums"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "podcast_episodes" ADD CONSTRAINT "podcast_episodes_podcast_id_fkey" FOREIGN KEY ("podcast_id") REFERENCES "podcasts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_modules" ADD CONSTRAINT "course_modules_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_lessons" ADD CONSTRAINT "course_lessons_course_module_id_fkey" FOREIGN KEY ("course_module_id") REFERENCES "course_modules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_movies" ADD CONSTRAINT "user_movies_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_movies" ADD CONSTRAINT "user_movies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_tv_shows" ADD CONSTRAINT "user_tv_shows_tv_show_id_fkey" FOREIGN KEY ("tv_show_id") REFERENCES "tv_shows"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_tv_shows" ADD CONSTRAINT "user_tv_shows_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_tv_seasons" ADD CONSTRAINT "user_tv_seasons_tv_season_id_fkey" FOREIGN KEY ("tv_season_id") REFERENCES "tv_seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_tv_seasons" ADD CONSTRAINT "user_tv_seasons_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_tv_episodes" ADD CONSTRAINT "user_tv_episodes_tv_episode_id_fkey" FOREIGN KEY ("tv_episode_id") REFERENCES "tv_episodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_tv_episodes" ADD CONSTRAINT "user_tv_episodes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_anime" ADD CONSTRAINT "user_anime_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "anime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_anime" ADD CONSTRAINT "user_anime_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_anime_episodes" ADD CONSTRAINT "user_anime_episodes_anime_episode_id_fkey" FOREIGN KEY ("anime_episode_id") REFERENCES "anime_episodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_anime_episodes" ADD CONSTRAINT "user_anime_episodes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_books" ADD CONSTRAINT "user_books_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_books" ADD CONSTRAINT "user_books_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_games" ADD CONSTRAINT "user_games_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_games" ADD CONSTRAINT "user_games_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_music_albums" ADD CONSTRAINT "user_music_albums_music_album_id_fkey" FOREIGN KEY ("music_album_id") REFERENCES "music_albums"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_music_albums" ADD CONSTRAINT "user_music_albums_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_music_tracks" ADD CONSTRAINT "user_music_tracks_music_track_id_fkey" FOREIGN KEY ("music_track_id") REFERENCES "music_tracks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_music_tracks" ADD CONSTRAINT "user_music_tracks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_podcasts" ADD CONSTRAINT "user_podcasts_podcast_id_fkey" FOREIGN KEY ("podcast_id") REFERENCES "podcasts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_podcasts" ADD CONSTRAINT "user_podcasts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_podcast_episodes" ADD CONSTRAINT "user_podcast_episodes_podcast_episode_id_fkey" FOREIGN KEY ("podcast_episode_id") REFERENCES "podcast_episodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_podcast_episodes" ADD CONSTRAINT "user_podcast_episodes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_courses" ADD CONSTRAINT "user_courses_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_courses" ADD CONSTRAINT "user_courses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_course_modules" ADD CONSTRAINT "user_course_modules_course_module_id_fkey" FOREIGN KEY ("course_module_id") REFERENCES "course_modules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_course_modules" ADD CONSTRAINT "user_course_modules_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_course_lessons" ADD CONSTRAINT "user_course_lessons_course_lesson_id_fkey" FOREIGN KEY ("course_lesson_id") REFERENCES "course_lessons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_course_lessons" ADD CONSTRAINT "user_course_lessons_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collections" ADD CONSTRAINT "collections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_items" ADD CONSTRAINT "collection_items_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "anime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_items" ADD CONSTRAINT "collection_items_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_items" ADD CONSTRAINT "collection_items_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_items" ADD CONSTRAINT "collection_items_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_items" ADD CONSTRAINT "collection_items_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_items" ADD CONSTRAINT "collection_items_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_items" ADD CONSTRAINT "collection_items_music_album_id_fkey" FOREIGN KEY ("music_album_id") REFERENCES "music_albums"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_items" ADD CONSTRAINT "collection_items_podcast_id_fkey" FOREIGN KEY ("podcast_id") REFERENCES "podcasts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_items" ADD CONSTRAINT "collection_items_tv_show_id_fkey" FOREIGN KEY ("tv_show_id") REFERENCES "tv_shows"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shelves" ADD CONSTRAINT "shelves_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shelf_items" ADD CONSTRAINT "shelf_items_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shelf_items" ADD CONSTRAINT "shelf_items_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shelf_items" ADD CONSTRAINT "shelf_items_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shelf_items" ADD CONSTRAINT "shelf_items_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shelf_items" ADD CONSTRAINT "shelf_items_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shelf_items" ADD CONSTRAINT "shelf_items_music_album_id_fkey" FOREIGN KEY ("music_album_id") REFERENCES "music_albums"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shelf_items" ADD CONSTRAINT "shelf_items_podcast_id_fkey" FOREIGN KEY ("podcast_id") REFERENCES "podcasts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shelf_items" ADD CONSTRAINT "shelf_items_shelf_id_fkey" FOREIGN KEY ("shelf_id") REFERENCES "shelves"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shelf_items" ADD CONSTRAINT "shelf_items_tv_show_id_fkey" FOREIGN KEY ("tv_show_id") REFERENCES "tv_shows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_lists" ADD CONSTRAINT "custom_lists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_list_items" ADD CONSTRAINT "custom_list_items_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_list_items" ADD CONSTRAINT "custom_list_items_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_list_items" ADD CONSTRAINT "custom_list_items_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_list_items" ADD CONSTRAINT "custom_list_items_custom_list_id_fkey" FOREIGN KEY ("custom_list_id") REFERENCES "custom_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_list_items" ADD CONSTRAINT "custom_list_items_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_list_items" ADD CONSTRAINT "custom_list_items_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_list_items" ADD CONSTRAINT "custom_list_items_music_album_id_fkey" FOREIGN KEY ("music_album_id") REFERENCES "music_albums"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_list_items" ADD CONSTRAINT "custom_list_items_podcast_id_fkey" FOREIGN KEY ("podcast_id") REFERENCES "podcasts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_list_items" ADD CONSTRAINT "custom_list_items_tv_show_id_fkey" FOREIGN KEY ("tv_show_id") REFERENCES "tv_shows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_tags" ADD CONSTRAINT "user_tags_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_tags" ADD CONSTRAINT "media_tags_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_tags" ADD CONSTRAINT "media_tags_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_tags" ADD CONSTRAINT "media_tags_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_tags" ADD CONSTRAINT "media_tags_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_tags" ADD CONSTRAINT "media_tags_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_tags" ADD CONSTRAINT "media_tags_music_album_id_fkey" FOREIGN KEY ("music_album_id") REFERENCES "music_albums"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_tags" ADD CONSTRAINT "media_tags_podcast_id_fkey" FOREIGN KEY ("podcast_id") REFERENCES "podcasts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_tags" ADD CONSTRAINT "media_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_tags" ADD CONSTRAINT "media_tags_tv_show_id_fkey" FOREIGN KEY ("tv_show_id") REFERENCES "tv_shows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_tags" ADD CONSTRAINT "media_tags_user_tag_id_fkey" FOREIGN KEY ("user_tag_id") REFERENCES "user_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memories" ADD CONSTRAINT "memories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memory_media" ADD CONSTRAINT "memory_media_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memory_media" ADD CONSTRAINT "memory_media_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memory_media" ADD CONSTRAINT "memory_media_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memory_media" ADD CONSTRAINT "memory_media_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memory_media" ADD CONSTRAINT "memory_media_memory_id_fkey" FOREIGN KEY ("memory_id") REFERENCES "memories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memory_media" ADD CONSTRAINT "memory_media_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memory_media" ADD CONSTRAINT "memory_media_music_album_id_fkey" FOREIGN KEY ("music_album_id") REFERENCES "music_albums"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memory_media" ADD CONSTRAINT "memory_media_podcast_id_fkey" FOREIGN KEY ("podcast_id") REFERENCES "podcasts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memory_media" ADD CONSTRAINT "memory_media_tv_show_id_fkey" FOREIGN KEY ("tv_show_id") REFERENCES "tv_shows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeline_events" ADD CONSTRAINT "timeline_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_quotes" ADD CONSTRAINT "favorite_quotes_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_quotes" ADD CONSTRAINT "favorite_quotes_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_quotes" ADD CONSTRAINT "favorite_quotes_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_quotes" ADD CONSTRAINT "favorite_quotes_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_quotes" ADD CONSTRAINT "favorite_quotes_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_quotes" ADD CONSTRAINT "favorite_quotes_podcast_id_fkey" FOREIGN KEY ("podcast_id") REFERENCES "podcasts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_quotes" ADD CONSTRAINT "favorite_quotes_tv_show_id_fkey" FOREIGN KEY ("tv_show_id") REFERENCES "tv_shows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_quotes" ADD CONSTRAINT "favorite_quotes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "highlights" ADD CONSTRAINT "highlights_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "highlights" ADD CONSTRAINT "highlights_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "highlights" ADD CONSTRAINT "highlights_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "highlights" ADD CONSTRAINT "highlights_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "highlights" ADD CONSTRAINT "highlights_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "highlights" ADD CONSTRAINT "highlights_music_album_id_fkey" FOREIGN KEY ("music_album_id") REFERENCES "music_albums"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "highlights" ADD CONSTRAINT "highlights_podcast_id_fkey" FOREIGN KEY ("podcast_id") REFERENCES "podcasts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "highlights" ADD CONSTRAINT "highlights_tv_show_id_fkey" FOREIGN KEY ("tv_show_id") REFERENCES "tv_shows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "highlights" ADD CONSTRAINT "highlights_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "search_histories" ADD CONSTRAINT "search_histories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_searches" ADD CONSTRAINT "saved_searches_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_feed" ADD CONSTRAINT "activity_feed_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_music_album_id_fkey" FOREIGN KEY ("music_album_id") REFERENCES "music_albums"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_podcast_id_fkey" FOREIGN KEY ("podcast_id") REFERENCES "podcasts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_tv_show_id_fkey" FOREIGN KEY ("tv_show_id") REFERENCES "tv_shows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wrapped_years" ADD CONSTRAINT "wrapped_years_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wrapped_stats" ADD CONSTRAINT "wrapped_stats_wrapped_year_id_fkey" FOREIGN KEY ("wrapped_year_id") REFERENCES "wrapped_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_snapshots" ADD CONSTRAINT "analytics_snapshots_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_sessions" ADD CONSTRAINT "device_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MusicAlbumToMusicArtist" ADD CONSTRAINT "_MusicAlbumToMusicArtist_A_fkey" FOREIGN KEY ("A") REFERENCES "music_albums"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MusicAlbumToMusicArtist" ADD CONSTRAINT "_MusicAlbumToMusicArtist_B_fkey" FOREIGN KEY ("B") REFERENCES "music_artists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

