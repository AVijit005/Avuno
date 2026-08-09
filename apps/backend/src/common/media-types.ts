import type { PrismaClient } from '@prisma/client';

/**
 * Single source of truth for the eight user-library media types.
 *
 * These delegate and field names were previously re-declared in seven
 * different places — analytics, collections (twice), interaction, journal,
 * library and progress — each maintained by hand. Nothing tied them to the
 * generated Prisma client, so a typo produced no compile error and no runtime
 * error either: the dynamic lookup simply returned undefined and the calling
 * code silently skipped that media type.
 *
 * That is not hypothetical. It is how `userId_mediaId` (a compound key that
 * does not exist on any model) and a library update whitelist naming ten
 * non-existent columns both shipped.
 *
 * The `satisfies` clause below is the load-bearing part: it forces TypeScript
 * to check every delegate name against PrismaClient, so a rename in
 * schema.prisma now fails the build instead of silently disabling a feature.
 */

export const MEDIA_TYPES = ['movie', 'tvShow', 'anime', 'book', 'game', 'musicAlbum', 'podcast', 'course'] as const;

export type MediaType = (typeof MEDIA_TYPES)[number];

/** Delegates on PrismaClient that hold a user's relationship to a media item. */
export type UserLibraryDelegateName =
  'userMovie' | 'userTvShow' | 'userAnime' | 'userBook' | 'userGame' | 'userMusicAlbum' | 'userPodcast' | 'userCourse';

/** Delegates on PrismaClient that hold the catalog record itself. */
export type MediaDelegateName = 'movie' | 'tvShow' | 'anime' | 'book' | 'game' | 'musicAlbum' | 'podcast' | 'course';

export interface MediaTypeConfig {
  /** e.g. 'movie' — the value used in DTOs and query params. */
  readonly type: MediaType;
  /** Junction delegate, e.g. prisma.userMovie */
  readonly userDelegate: UserLibraryDelegateName;
  /** Catalog delegate, e.g. prisma.movie */
  readonly mediaDelegate: MediaDelegateName;
  /** Foreign key on the junction row, e.g. 'movieId' */
  readonly mediaIdField: string;
  /**
   * Name of the Prisma compound unique for (userId, <mediaIdField>).
   *
   * Prisma generates `userId_movieId`, not `userId_mediaId`. Code that
   * hardcoded the latter threw on every call; deriving it here removes the
   * chance of getting it wrong again.
   */
  readonly userMediaUnique: string;
}

function config(
  type: MediaType,
  userDelegate: UserLibraryDelegateName,
  mediaDelegate: MediaDelegateName,
  mediaIdField: string,
): MediaTypeConfig {
  return { type, userDelegate, mediaDelegate, mediaIdField, userMediaUnique: `userId_${mediaIdField}` };
}

export const MEDIA_TYPE_CONFIG = {
  movie: config('movie', 'userMovie', 'movie', 'movieId'),
  tvShow: config('tvShow', 'userTvShow', 'tvShow', 'tvShowId'),
  anime: config('anime', 'userAnime', 'anime', 'animeId'),
  book: config('book', 'userBook', 'book', 'bookId'),
  game: config('game', 'userGame', 'game', 'gameId'),
  musicAlbum: config('musicAlbum', 'userMusicAlbum', 'musicAlbum', 'musicAlbumId'),
  podcast: config('podcast', 'userPodcast', 'podcast', 'podcastId'),
  course: config('course', 'userCourse', 'course', 'courseId'),
} as const satisfies Record<MediaType, MediaTypeConfig>;

export const MEDIA_TYPE_CONFIGS: readonly MediaTypeConfig[] = MEDIA_TYPES.map((t) => MEDIA_TYPE_CONFIG[t]);

/**
 * Compile-time proof that every delegate name above exists on PrismaClient.
 *
 * If a model is renamed in schema.prisma this assignment stops type-checking,
 * which is the entire point: the failure surfaces at build time rather than as
 * a feature that quietly stops working in production.
 */
type _AssertUserDelegatesExist = UserLibraryDelegateName extends keyof PrismaClient ? true : never;
type _AssertMediaDelegatesExist = MediaDelegateName extends keyof PrismaClient ? true : never;
const _userDelegatesExist: _AssertUserDelegatesExist = true;
const _mediaDelegatesExist: _AssertMediaDelegatesExist = true;
void _userDelegatesExist;
void _mediaDelegatesExist;

export function isMediaType(value: unknown): value is MediaType {
  return typeof value === 'string' && (MEDIA_TYPES as readonly string[]).includes(value);
}

export function mediaTypeConfig(type: string): MediaTypeConfig | null {
  return isMediaType(type) ? MEDIA_TYPE_CONFIG[type] : null;
}
