/**
 * Media types that can be attached to journal content.
 *
 * Kept in its own module rather than in journal.service.ts because the DTOs
 * validate against it and the service imports the DTOs — putting it in the
 * service would create an import cycle.
 *
 * The value selects a Prisma delegate at runtime (see MEDIA_LOOKUP), so it
 * must always be validated against this allowlist.
 */
export const JOURNAL_MEDIA_TYPES = [
  'movie',
  'tvShow',
  'anime',
  'book',
  'game',
  'musicAlbum',
  'podcast',
  'course',
] as const;

export type JournalMediaType = (typeof JOURNAL_MEDIA_TYPES)[number];
