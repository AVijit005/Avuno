-- DropForeignKey
ALTER TABLE "custom_list_items" DROP CONSTRAINT "custom_list_items_anime_id_fkey";

-- DropForeignKey
ALTER TABLE "custom_list_items" DROP CONSTRAINT "custom_list_items_book_id_fkey";

-- DropForeignKey
ALTER TABLE "custom_list_items" DROP CONSTRAINT "custom_list_items_course_id_fkey";

-- DropForeignKey
ALTER TABLE "custom_list_items" DROP CONSTRAINT "custom_list_items_game_id_fkey";

-- DropForeignKey
ALTER TABLE "custom_list_items" DROP CONSTRAINT "custom_list_items_movie_id_fkey";

-- DropForeignKey
ALTER TABLE "custom_list_items" DROP CONSTRAINT "custom_list_items_music_album_id_fkey";

-- DropForeignKey
ALTER TABLE "custom_list_items" DROP CONSTRAINT "custom_list_items_podcast_id_fkey";

-- DropForeignKey
ALTER TABLE "custom_list_items" DROP CONSTRAINT "custom_list_items_tv_show_id_fkey";

-- DropForeignKey
ALTER TABLE "favorite_quotes" DROP CONSTRAINT "favorite_quotes_anime_id_fkey";

-- DropForeignKey
ALTER TABLE "favorite_quotes" DROP CONSTRAINT "favorite_quotes_book_id_fkey";

-- DropForeignKey
ALTER TABLE "favorite_quotes" DROP CONSTRAINT "favorite_quotes_course_id_fkey";

-- DropForeignKey
ALTER TABLE "favorite_quotes" DROP CONSTRAINT "favorite_quotes_game_id_fkey";

-- DropForeignKey
ALTER TABLE "favorite_quotes" DROP CONSTRAINT "favorite_quotes_movie_id_fkey";

-- DropForeignKey
ALTER TABLE "favorite_quotes" DROP CONSTRAINT "favorite_quotes_podcast_id_fkey";

-- DropForeignKey
ALTER TABLE "favorite_quotes" DROP CONSTRAINT "favorite_quotes_tv_show_id_fkey";

-- DropForeignKey
ALTER TABLE "highlights" DROP CONSTRAINT "highlights_anime_id_fkey";

-- DropForeignKey
ALTER TABLE "highlights" DROP CONSTRAINT "highlights_book_id_fkey";

-- DropForeignKey
ALTER TABLE "highlights" DROP CONSTRAINT "highlights_course_id_fkey";

-- DropForeignKey
ALTER TABLE "highlights" DROP CONSTRAINT "highlights_game_id_fkey";

-- DropForeignKey
ALTER TABLE "highlights" DROP CONSTRAINT "highlights_movie_id_fkey";

-- DropForeignKey
ALTER TABLE "highlights" DROP CONSTRAINT "highlights_music_album_id_fkey";

-- DropForeignKey
ALTER TABLE "highlights" DROP CONSTRAINT "highlights_podcast_id_fkey";

-- DropForeignKey
ALTER TABLE "highlights" DROP CONSTRAINT "highlights_tv_show_id_fkey";

-- DropForeignKey
ALTER TABLE "media_tags" DROP CONSTRAINT "media_tags_anime_id_fkey";

-- DropForeignKey
ALTER TABLE "media_tags" DROP CONSTRAINT "media_tags_book_id_fkey";

-- DropForeignKey
ALTER TABLE "media_tags" DROP CONSTRAINT "media_tags_course_id_fkey";

-- DropForeignKey
ALTER TABLE "media_tags" DROP CONSTRAINT "media_tags_game_id_fkey";

-- DropForeignKey
ALTER TABLE "media_tags" DROP CONSTRAINT "media_tags_movie_id_fkey";

-- DropForeignKey
ALTER TABLE "media_tags" DROP CONSTRAINT "media_tags_music_album_id_fkey";

-- DropForeignKey
ALTER TABLE "media_tags" DROP CONSTRAINT "media_tags_podcast_id_fkey";

-- DropForeignKey
ALTER TABLE "media_tags" DROP CONSTRAINT "media_tags_tv_show_id_fkey";

-- DropForeignKey
ALTER TABLE "memory_media" DROP CONSTRAINT "memory_media_anime_id_fkey";

-- DropForeignKey
ALTER TABLE "memory_media" DROP CONSTRAINT "memory_media_book_id_fkey";

-- DropForeignKey
ALTER TABLE "memory_media" DROP CONSTRAINT "memory_media_course_id_fkey";

-- DropForeignKey
ALTER TABLE "memory_media" DROP CONSTRAINT "memory_media_game_id_fkey";

-- DropForeignKey
ALTER TABLE "memory_media" DROP CONSTRAINT "memory_media_movie_id_fkey";

-- DropForeignKey
ALTER TABLE "memory_media" DROP CONSTRAINT "memory_media_music_album_id_fkey";

-- DropForeignKey
ALTER TABLE "memory_media" DROP CONSTRAINT "memory_media_podcast_id_fkey";

-- DropForeignKey
ALTER TABLE "memory_media" DROP CONSTRAINT "memory_media_tv_show_id_fkey";

-- DropForeignKey
ALTER TABLE "recommendations" DROP CONSTRAINT "recommendations_anime_id_fkey";

-- DropForeignKey
ALTER TABLE "recommendations" DROP CONSTRAINT "recommendations_book_id_fkey";

-- DropForeignKey
ALTER TABLE "recommendations" DROP CONSTRAINT "recommendations_course_id_fkey";

-- DropForeignKey
ALTER TABLE "recommendations" DROP CONSTRAINT "recommendations_game_id_fkey";

-- DropForeignKey
ALTER TABLE "recommendations" DROP CONSTRAINT "recommendations_movie_id_fkey";

-- DropForeignKey
ALTER TABLE "recommendations" DROP CONSTRAINT "recommendations_music_album_id_fkey";

-- DropForeignKey
ALTER TABLE "recommendations" DROP CONSTRAINT "recommendations_podcast_id_fkey";

-- DropForeignKey
ALTER TABLE "recommendations" DROP CONSTRAINT "recommendations_tv_show_id_fkey";

-- DropForeignKey
ALTER TABLE "shelf_items" DROP CONSTRAINT "shelf_items_anime_id_fkey";

-- DropForeignKey
ALTER TABLE "shelf_items" DROP CONSTRAINT "shelf_items_book_id_fkey";

-- DropForeignKey
ALTER TABLE "shelf_items" DROP CONSTRAINT "shelf_items_course_id_fkey";

-- DropForeignKey
ALTER TABLE "shelf_items" DROP CONSTRAINT "shelf_items_game_id_fkey";

-- DropForeignKey
ALTER TABLE "shelf_items" DROP CONSTRAINT "shelf_items_movie_id_fkey";

-- DropForeignKey
ALTER TABLE "shelf_items" DROP CONSTRAINT "shelf_items_music_album_id_fkey";

-- DropForeignKey
ALTER TABLE "shelf_items" DROP CONSTRAINT "shelf_items_podcast_id_fkey";

-- DropForeignKey
ALTER TABLE "shelf_items" DROP CONSTRAINT "shelf_items_tv_show_id_fkey";

-- DropForeignKey
ALTER TABLE "tv_episodes" DROP CONSTRAINT "tv_episodes_tv_season_id_fkey";

-- DropForeignKey
ALTER TABLE "user_anime_episodes" DROP CONSTRAINT "user_anime_episodes_anime_episode_id_fkey";

-- DropForeignKey
ALTER TABLE "user_tv_episodes" DROP CONSTRAINT "user_tv_episodes_tv_episode_id_fkey";

-- DropForeignKey
ALTER TABLE "user_tv_seasons" DROP CONSTRAINT "user_tv_seasons_tv_season_id_fkey";

-- AlterTable
ALTER TABLE "memories" ADD COLUMN     "journal_id" UUID,
ADD COLUMN     "quote_id" UUID;

-- AlterTable
ALTER TABLE "timeline_events" ADD COLUMN     "memory_id" UUID;

-- CreateTable
CREATE TABLE "follows" (
    "id" UUID NOT NULL,
    "follower_id" UUID NOT NULL,
    "following_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "follows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "likes" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "media_type" TEXT NOT NULL,
    "media_id" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "content" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "plan_tier" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "stripe_id" TEXT,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "taste_segments" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "segment" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "taste_segments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wrapped_shares" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wrapped_shares_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "follows_follower_id_idx" ON "follows"("follower_id");

-- CreateIndex
CREATE INDEX "follows_following_id_idx" ON "follows"("following_id");

-- CreateIndex
CREATE UNIQUE INDEX "follows_follower_id_following_id_key" ON "follows"("follower_id", "following_id");

-- CreateIndex
CREATE INDEX "likes_user_id_idx" ON "likes"("user_id");

-- CreateIndex
CREATE INDEX "likes_entity_type_entity_id_idx" ON "likes"("entity_type", "entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "likes_user_id_entity_type_entity_id_key" ON "likes"("user_id", "entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "comments_user_id_idx" ON "comments"("user_id");

-- CreateIndex
CREATE INDEX "comments_entity_type_entity_id_idx" ON "comments"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "reviews_user_id_idx" ON "reviews"("user_id");

-- CreateIndex
CREATE INDEX "reviews_media_type_media_id_idx" ON "reviews"("media_type", "media_id");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_user_id_media_type_media_id_key" ON "reviews"("user_id", "media_type", "media_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_user_id_key" ON "subscriptions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "taste_segments_user_id_segment_key" ON "taste_segments"("user_id", "segment");

-- CreateIndex
CREATE UNIQUE INDEX "wrapped_shares_url_key" ON "wrapped_shares"("url");

-- CreateIndex
CREATE INDEX "wrapped_shares_user_id_year_idx" ON "wrapped_shares"("user_id", "year");

-- AddForeignKey
ALTER TABLE "tv_episodes" ADD CONSTRAINT "tv_episodes_tv_season_id_fkey" FOREIGN KEY ("tv_season_id") REFERENCES "tv_seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_tv_seasons" ADD CONSTRAINT "user_tv_seasons_tv_season_id_fkey" FOREIGN KEY ("tv_season_id") REFERENCES "tv_seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_tv_episodes" ADD CONSTRAINT "user_tv_episodes_tv_episode_id_fkey" FOREIGN KEY ("tv_episode_id") REFERENCES "tv_episodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_anime_episodes" ADD CONSTRAINT "user_anime_episodes_anime_episode_id_fkey" FOREIGN KEY ("anime_episode_id") REFERENCES "anime_episodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "shelf_items" ADD CONSTRAINT "shelf_items_tv_show_id_fkey" FOREIGN KEY ("tv_show_id") REFERENCES "tv_shows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_list_items" ADD CONSTRAINT "custom_list_items_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_list_items" ADD CONSTRAINT "custom_list_items_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_list_items" ADD CONSTRAINT "custom_list_items_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "media_tags" ADD CONSTRAINT "media_tags_tv_show_id_fkey" FOREIGN KEY ("tv_show_id") REFERENCES "tv_shows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memories" ADD CONSTRAINT "memories_journal_id_fkey" FOREIGN KEY ("journal_id") REFERENCES "journal_entries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memories" ADD CONSTRAINT "memories_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "favorite_quotes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memory_media" ADD CONSTRAINT "memory_media_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memory_media" ADD CONSTRAINT "memory_media_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memory_media" ADD CONSTRAINT "memory_media_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memory_media" ADD CONSTRAINT "memory_media_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memory_media" ADD CONSTRAINT "memory_media_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memory_media" ADD CONSTRAINT "memory_media_music_album_id_fkey" FOREIGN KEY ("music_album_id") REFERENCES "music_albums"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memory_media" ADD CONSTRAINT "memory_media_podcast_id_fkey" FOREIGN KEY ("podcast_id") REFERENCES "podcasts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memory_media" ADD CONSTRAINT "memory_media_tv_show_id_fkey" FOREIGN KEY ("tv_show_id") REFERENCES "tv_shows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeline_events" ADD CONSTRAINT "timeline_events_memory_id_fkey" FOREIGN KEY ("memory_id") REFERENCES "memories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE "memories" ADD CONSTRAINT "check_evidence_limit" CHECK ("journal_id" IS NULL OR "quote_id" IS NULL);
