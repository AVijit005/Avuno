import type { PrismaService } from '../prisma/prisma.service';
import {
  MEDIA_TYPE_CONFIGS,
  mediaTypeConfig,
  type MediaTypeConfig,
  type MediaDelegateName,
  type UserLibraryDelegateName,
} from './media-types';

/**
 * Typed access to Prisma delegates chosen at runtime.
 *
 * Twelve files each defined their own `prismaAny(): Record<string, any>` and
 * indexed into it with a string. That erased the generated types across most
 * of the data layer, and every one of those files carried a blanket
 * `eslint-disable @typescript-eslint/no-explicit-any` so the linter stayed
 * quiet about it.
 *
 * The cost was real: `where: { userId_mediaId: ... }` (a compound key that
 * exists on no model) and an update whitelist naming ten non-existent columns
 * both shipped, because `as any` suppressed the errors that would have caught
 * them.
 *
 * The delegate NAMES are now verified against PrismaClient at compile time by
 * media-types.ts. What remains dynamic is only the selection, which genuinely
 * is a runtime decision. The operation surface is narrowed to the subset the
 * repositories actually use, so query shapes stay checked.
 */

/** The Prisma operations the dynamic call sites use. */
export interface QueryableDelegate {
  findFirst(args: Record<string, unknown>): Promise<Record<string, unknown> | null>;
  findUnique(args: Record<string, unknown>): Promise<Record<string, unknown> | null>;
  findMany(args?: Record<string, unknown>): Promise<Record<string, unknown>[]>;
  count(args?: Record<string, unknown>): Promise<number>;
  create(args: Record<string, unknown>): Promise<Record<string, unknown>>;
  createMany(args: Record<string, unknown>): Promise<{ count: number }>;
  update(args: Record<string, unknown>): Promise<Record<string, unknown>>;
  updateMany(args: Record<string, unknown>): Promise<{ count: number }>;
  delete(args: Record<string, unknown>): Promise<Record<string, unknown>>;
  deleteMany(args: Record<string, unknown>): Promise<{ count: number }>;
  groupBy(args: Record<string, unknown>): Promise<Record<string, unknown>[]>;
  aggregate(args: Record<string, unknown>): Promise<Record<string, unknown>>;
  upsert(args: Record<string, unknown>): Promise<Record<string, unknown>>;
}

/** Anything that exposes Prisma delegates: the client, or a transaction. */
export type DelegateHost = Record<string, unknown>;

/**
 * Resolve a delegate by name.
 *
 * Throws rather than returning null on a miss. The previous pattern was
 * `if (!delegate) return []`, which turned a typo into silently missing data
 * — the worst possible failure mode, because nothing surfaces anywhere.
 */
export function delegate(host: DelegateHost, name: string): QueryableDelegate {
  const value = host[name];
  if (!value || typeof value !== 'object') {
    throw new Error(
      `Prisma delegate "${name}" does not exist. This is a programming error: ` +
        'delegate names are verified against PrismaClient in common/media-types.ts.',
    );
  }
  return value as unknown as QueryableDelegate;
}

export function userLibraryDelegate(host: DelegateHost, name: UserLibraryDelegateName): QueryableDelegate {
  return delegate(host, name);
}

export function mediaDelegate(host: DelegateHost, name: MediaDelegateName): QueryableDelegate {
  return delegate(host, name);
}

/** Every user-library delegate paired with its config, for fan-out queries. */
export function eachUserLibraryDelegate(
  host: DelegateHost,
): Array<{ config: MediaTypeConfig; delegate: QueryableDelegate }> {
  return MEDIA_TYPE_CONFIGS.map((config) => ({
    config,
    delegate: delegate(host, config.userDelegate),
  }));
}

/** Resolve the delegate for one media type, or null when the type is unknown. */
export function userLibraryDelegateFor(
  host: DelegateHost,
  type: string,
): { config: MediaTypeConfig; delegate: QueryableDelegate } | null {
  const config = mediaTypeConfig(type);
  if (!config) return null;
  return { config, delegate: delegate(host, config.userDelegate) };
}

/** Treat a PrismaService (or transaction client) as a delegate host. */
export function asHost(prisma: PrismaService | unknown): DelegateHost {
  return prisma as DelegateHost;
}

/**
 * Narrow a dynamically-fetched row to the shape the repository declares.
 *
 * Prisma cannot infer a return type when the delegate is selected at runtime,
 * so a cast is unavoidable at exactly this boundary. Naming it keeps those
 * casts greppable and confined to the point where the row leaves the dynamic
 * layer, instead of `as any` spreading through the call sites.
 */
export function asRow<T>(value: Record<string, unknown> | null): T | null {
  return value as T | null;
}

export function asRows<T>(values: Record<string, unknown>[]): T[] {
  return values as unknown as T[];
}
