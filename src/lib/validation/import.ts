import { z } from "zod";

const MediaStatusSchema = z.enum([
  "in_progress",
  "completed",
  "planning",
  "paused",
  "dropped",
  "rewatching",
  "archived",
]);

const StoredMetaSchema = z
  .object({
    status: MediaStatusSchema.optional(),
    favorite: z.boolean().optional(),
    completedAt: z.string().optional(),
    lastActivityAt: z.string().optional(),
    timesWatched: z.number().int().nonnegative().optional(),
    priority: z.enum(["high", "med", "low"]).optional(),
    reasonSaved: z.string().max(500).optional(),
    droppedAtLabel: z.string().max(100).optional(),
    addedAt: z.string().optional(),
    journalExcerpt: z.string().max(2000).optional(),
    progress: z.number().int().min(0).max(100).optional(),
    progressLabel: z.string().max(100).optional(),
    rating: z.number().min(0).max(5).optional(),
    tags: z.array(z.string().max(50)).max(100).optional(),
    shelfIds: z.array(z.string().max(100)).max(50).optional(),
    collectionIds: z.array(z.string().max(100)).max(50).optional(),
    mood: z.string().max(50).optional(),
    reflection: z.string().max(5000).optional(),
  })
  .strict();

const MediaItemSchema = z
  .object({
    id: z.string().min(1).max(100),
    title: z.string().min(1).max(500),
    kind: z.string().min(1).max(50),
    year: z.number().int().min(1800).max(2100).optional(),
    poster: z.string().url().max(2000).nullable().optional(),
    backdrop: z.string().url().max(2000).nullable().optional(),
    rating: z.number().min(0).max(5).nullable().optional(),
    progress: z.number().int().min(0).max(100).nullable().optional(),
    status: z.string().max(50),
    genres: z.array(z.string().max(50)).max(20).optional(),
    runtime: z.string().max(50).nullable().optional(),
    creator: z.string().max(200).nullable().optional(),
    accent: z.string().max(50).nullable().optional(),
    synopsis: z.string().max(5000).optional(),
  })
  .strict();

const ProgressEntrySchema = z
  .object({
    at: z.string(),
    pct: z.number().int().min(0).max(100),
    note: z.string().max(500).optional(),
    label: z.string().max(100).optional(),
  })
  .strict();

const UserQuoteSchema = z
  .object({
    id: z.string().max(100),
    text: z.string().min(1).max(2000),
    refId: z.string().max(100).optional(),
    refTitle: z.string().max(500).optional(),
    accent: z.string().max(50).optional(),
    at: z.string(),
  })
  .strict();

const ShelfSchema = z
  .object({
    id: z.string().max(100),
    name: z.string().min(1).max(200),
    accent: z.string().max(50).optional(),
    itemIds: z.array(z.string().max(100)).max(10000),
  })
  .strict();

const CollectionSchema = z
  .object({
    id: z.string().max(100),
    name: z.string().min(1).max(200),
    note: z.string().max(1000).optional(),
    accent: z.string().max(50).optional(),
    cover: z.string().url().max(2000).optional(),
    itemIds: z.array(z.string().max(100)).max(10000),
    pinned: z.boolean().optional(),
    favorite: z.boolean().optional(),
  })
  .strict();

export const ImportSchema = z
  .object({
    version: z.number().int().optional(),
    exportedAt: z.string().optional(),
    meta: z.record(z.string().max(100), StoredMetaSchema).optional(),
    customItems: z.array(MediaItemSchema).max(10000).optional(),
    shelves: z.array(ShelfSchema).max(1000).optional(),
    collections: z.array(CollectionSchema).max(1000).optional(),
    userQuotes: z.array(UserQuoteSchema).max(5000).optional(),
  })
  .strict()
  .refine(
    (data) =>
      data.meta !== undefined ||
      data.customItems !== undefined ||
      data.shelves !== undefined ||
      data.collections !== undefined ||
      data.userQuotes !== undefined,
    {
      message:
        "Import must contain at least one of: meta, customItems, shelves, collections, userQuotes",
    },
  );

export type ValidatedImport = z.infer<typeof ImportSchema>;
