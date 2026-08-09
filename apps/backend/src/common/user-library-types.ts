import type {
  Prisma,
  UserMovie,
  UserTvShow,
  UserAnime,
  UserBook,
  UserGame,
  UserMusicAlbum,
  UserPodcast,
  UserCourse,
} from '@prisma/client';

type UserMovieWhereInput = Prisma.UserMovieWhereInput;
type UserTvShowWhereInput = Prisma.UserTvShowWhereInput;
type UserAnimeWhereInput = Prisma.UserAnimeWhereInput;
type UserBookWhereInput = Prisma.UserBookWhereInput;
type UserGameWhereInput = Prisma.UserGameWhereInput;
type UserMusicAlbumWhereInput = Prisma.UserMusicAlbumWhereInput;
type UserPodcastWhereInput = Prisma.UserPodcastWhereInput;
type UserCourseWhereInput = Prisma.UserCourseWhereInput;
type UserMovieUpdateInput = Prisma.UserMovieUpdateInput;
type UserTvShowUpdateInput = Prisma.UserTvShowUpdateInput;
type UserAnimeUpdateInput = Prisma.UserAnimeUpdateInput;
type UserBookUpdateInput = Prisma.UserBookUpdateInput;
type UserGameUpdateInput = Prisma.UserGameUpdateInput;
type UserMusicAlbumUpdateInput = Prisma.UserMusicAlbumUpdateInput;
type UserPodcastUpdateInput = Prisma.UserPodcastUpdateInput;
type UserCourseUpdateInput = Prisma.UserCourseUpdateInput;
type UserMovieCreateInput = Prisma.UserMovieCreateInput;
type UserTvShowCreateInput = Prisma.UserTvShowCreateInput;
type UserAnimeCreateInput = Prisma.UserAnimeCreateInput;
type UserBookCreateInput = Prisma.UserBookCreateInput;
type UserGameCreateInput = Prisma.UserGameCreateInput;
type UserMusicAlbumCreateInput = Prisma.UserMusicAlbumCreateInput;
type UserPodcastCreateInput = Prisma.UserPodcastCreateInput;
type UserCourseCreateInput = Prisma.UserCourseCreateInput;
type UserMovieDelegate = Prisma.UserMovieDelegate;
type UserTvShowDelegate = Prisma.UserTvShowDelegate;
type UserAnimeDelegate = Prisma.UserAnimeDelegate;
type UserBookDelegate = Prisma.UserBookDelegate;
type UserGameDelegate = Prisma.UserGameDelegate;
type UserMusicAlbumDelegate = Prisma.UserMusicAlbumDelegate;
type UserPodcastDelegate = Prisma.UserPodcastDelegate;
type UserCourseDelegate = Prisma.UserCourseDelegate;
type InputJsonValue = Prisma.InputJsonValue;
import type { MediaType, UserLibraryDelegateName, MediaDelegateName } from './media-types';

/**
 * Union of every user-library junction row type. These eight models share
 * the same shape (userId, <mediaIdField>, status, rating, timestamps, ...)
 * but Prisma generates a distinct type for each, so code that operates on
 * any of them needs this union rather than `Record<string, any>`.
 */
export type UserLibraryRow =
  UserMovie | UserTvShow | UserAnime | UserBook | UserGame | UserMusicAlbum | UserPodcast | UserCourse;

export type UserLibraryRowWithMetadata = UserLibraryRow & {
  metadata: InputJsonValue;
};

export type UserLibraryWhereInput =
  | UserMovieWhereInput
  | UserTvShowWhereInput
  | UserAnimeWhereInput
  | UserBookWhereInput
  | UserGameWhereInput
  | UserMusicAlbumWhereInput
  | UserPodcastWhereInput
  | UserCourseWhereInput;

export type UserLibraryUpdateInput =
  | UserMovieUpdateInput
  | UserTvShowUpdateInput
  | UserAnimeUpdateInput
  | UserBookUpdateInput
  | UserGameUpdateInput
  | UserMusicAlbumUpdateInput
  | UserPodcastUpdateInput
  | UserCourseUpdateInput;

export type UserLibraryCreateInput =
  | UserMovieCreateInput
  | UserTvShowCreateInput
  | UserAnimeCreateInput
  | UserBookCreateInput
  | UserGameCreateInput
  | UserMusicAlbumCreateInput
  | UserPodcastCreateInput
  | UserCourseCreateInput;

export type UserLibraryDelegate =
  | UserMovieDelegate
  | UserTvShowDelegate
  | UserAnimeDelegate
  | UserBookDelegate
  | UserGameDelegate
  | UserMusicAlbumDelegate
  | UserPodcastDelegate
  | UserCourseDelegate;

/**
 * Per-media-type Prisma type bundles, indexed by MediaType. Lets a generic
 * repository carry the right delegate / where / update types for T instead
 * of falling back to `any`.
 */
export interface UserLibraryTypeBundle<_T extends MediaType> {
  row: UserLibraryRow;
  where: UserLibraryWhereInput;
  update: UserLibraryUpdateInput;
  create: UserLibraryCreateInput;
  delegate: UserLibraryDelegate;
  userDelegate: UserLibraryDelegateName;
  mediaDelegate: MediaDelegateName;
}

export const USER_LIBRARY_ROW_KEYS: ReadonlySet<string> = new Set([
  'id',
  'userId',
  'status',
  'rating',
  'rewatchCount',
  'favorite',
  'bookmarked',
  'bookmarkedAt',
  'liked',
  'hidden',
  'private',
  'notes',
  'startedAt',
  'finishedAt',
  'lastInteractionAt',
  'progress',
  'progressPercentage',
  'currentEpisode',
  'currentSeason',
  'currentChapter',
  'currentPage',
  'currentTrack',
  'currentLesson',
  'hoursSpent',
  'minutesSpent',
  'metadata',
  'createdAt',
  'updatedAt',
  'deletedAt',
]);

export function isUserLibraryKey(key: string): boolean {
  return USER_LIBRARY_ROW_KEYS.has(key);
}
