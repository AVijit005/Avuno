import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';

export interface UserAuthState {
  status: string;
  role: string;
  deleted: boolean;
}

const CACHE_PREFIX = 'user:state:';
/**
 * Short enough that a suspension takes effect almost immediately, long enough
 * that the guard does not add a database round-trip to every request.
 * Explicit invalidation on state change keeps the window near zero in practice.
 */
const CACHE_TTL_SECONDS = 30;

/**
 * Supplies the live account state the auth guard needs.
 *
 * Previously the guard trusted the JWT alone, so `role` was whatever it was
 * when the token was minted and account status was never consulted. A
 * suspended, soft-deleted or demoted user retained their previous access for
 * the remaining token lifetime.
 */
@Injectable()
export class UserStateService {
  private readonly logger = new Logger(UserStateService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async getState(userId: string): Promise<UserAuthState | null> {
    const key = `${CACHE_PREFIX}${userId}`;

    try {
      const cached = await this.redis.getClient().get(key);
      if (cached) return JSON.parse(cached) as UserAuthState;
    } catch {
      // Cache unavailable — fall through to the database rather than failing
      // the request.
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { status: true, role: true, deletedAt: true },
    });

    if (!user) return null;

    const state: UserAuthState = {
      status: String(user.status),
      role: String(user.role),
      deleted: user.deletedAt !== null,
    };

    try {
      await this.redis.getClient().set(key, JSON.stringify(state), 'EX', CACHE_TTL_SECONDS);
    } catch {
      // Non-fatal: the next request simply reads the database again.
    }

    return state;
  }

  /** Call after any change to status, role or soft-delete. */
  async invalidate(userId: string): Promise<void> {
    try {
      await this.redis.getClient().del(`${CACHE_PREFIX}${userId}`);
    } catch (error) {
      this.logger.warn(`Failed to invalidate cached state for user ${userId}`, error as Error);
    }
  }
}
