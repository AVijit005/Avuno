/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Internal signal used to abort the deleteWrappedYear transaction when the row
 * does not belong to the caller. Never escapes the repository.
 */
class WrappedYearNotDeletableError extends Error {}

@Injectable()
export class WrappedRepository {
  constructor(private readonly prisma: PrismaService) {}

  private prismaAny(): Record<string, any> {
    return this.prisma as unknown as Record<string, any>;
  }

  async createWrappedYear(data: { userId: string; year: number; metadata?: any }): Promise<Record<string, any>> {
    const delegate = this.prismaAny().wrappedYear;
    if (!delegate) throw new Error('WrappedYear model not available');
    return delegate.create({ data });
  }

  async findWrappedYear(userId: string, year: number): Promise<Record<string, any> | null> {
    const delegate = this.prismaAny().wrappedYear;
    if (!delegate) return null;
    return delegate.findUnique({
      where: { userId_year: { userId, year } },
      include: { stats: { orderBy: { sortOrder: 'asc' } } },
    });
  }

  async findWrappedYearsByUserId(userId: string): Promise<Record<string, any>[]> {
    const delegate = this.prismaAny().wrappedYear;
    if (!delegate) return [];
    return delegate.findMany({
      where: { userId },
      orderBy: { year: 'desc' },
      include: { _count: { select: { stats: true } } },
    });
  }

  async updateWrappedYear(id: string, data: Record<string, any>): Promise<Record<string, any>> {
    const delegate = this.prismaAny().wrappedYear;
    if (!delegate) throw new Error('WrappedYear model not available');
    return delegate.update({ where: { id }, data });
  }

  async deleteWrappedYear(id: string, userId: string): Promise<boolean> {
    const yearDelegate = this.prismaAny().wrappedYear;
    const statDelegate = this.prismaAny().wrappedStat;
    if (!yearDelegate || !statDelegate) return false;

    // Verify ownership BEFORE deleting the children, inside the transaction.
    //
    // The array form of $transaction cannot be used here: a zero-row delete is
    // not an error, so it would commit — deleting another user's stats while
    // their WrappedYear row survived. The interactive form lets us abort.
    return this.prisma
      .$transaction(async (tx) => {
        const txAny = tx as unknown as {
          wrappedYear: {
            deleteMany(args: { where: { id: string; userId: string } }): Promise<{ count: number }>;
          };
          wrappedStat: {
            deleteMany(args: { where: { wrappedYearId: string } }): Promise<{ count: number }>;
          };
        };

        const deleted = await txAny.wrappedYear.deleteMany({ where: { id, userId } });
        if (deleted.count === 0) throw new WrappedYearNotDeletableError();

        await txAny.wrappedStat.deleteMany({ where: { wrappedYearId: id } });
        return true;
      })
      .catch((error) => {
        if (error instanceof WrappedYearNotDeletableError) return false;
        throw error;
      });
  }

  async upsertStats(
    wrappedYearId: string,
    stats: Array<{ title: string; value: string; icon?: string; sortOrder: number }>,
  ): Promise<void> {
    const delegate = this.prismaAny().wrappedStat;
    if (!delegate) return;

    // Replace atomically. Previously this deleted the existing rows and then
    // inserted the new ones one at a time outside any transaction, so a
    // failure partway through left the WrappedYear with zero stats and no way
    // to recover short of regenerating.
    //
    // createMany also turns N round-trips into one.
    await this.prisma.$transaction([
      delegate.deleteMany({ where: { wrappedYearId } }),
      delegate.createMany({
        data: stats.map((stat) => ({
          wrappedYearId,
          title: stat.title,
          value: stat.value,
          icon: stat.icon ?? null,
          sortOrder: stat.sortOrder,
        })),
      }),
    ]);
  }
}
