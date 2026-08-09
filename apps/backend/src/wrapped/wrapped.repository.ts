import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { asHost, delegate, type QueryableDelegate } from '../common/prisma-delegates';

export interface WrappedYearRow {
  id: string;
  userId: string;
  year: number;
  metadata?: Prisma.JsonValue;
  generatedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  stats?: WrappedStatRow[];
  _count?: { stats?: number };
}

export interface WrappedStatRow {
  id: string;
  wrappedYearId: string;
  title: string;
  value: string;
  icon?: string | null;
  sortOrder: number;
}

/**
 * Internal signal used to abort the deleteWrappedYear transaction when the row
 * does not belong to the caller. Never escapes the repository.
 */
class WrappedYearNotDeletableError extends Error {}

@Injectable()
export class WrappedRepository {
  constructor(private readonly prisma: PrismaService) {}

  private host(): ReturnType<typeof asHost> {
    return asHost(this.prisma);
  }

  private wrappedYear(): QueryableDelegate {
    return delegate(this.host(), 'wrappedYear');
  }

  private wrappedStat(): QueryableDelegate {
    return delegate(this.host(), 'wrappedStat');
  }

  async createWrappedYear(data: {
    userId: string;
    year: number;
    metadata?: Prisma.JsonValue;
  }): Promise<WrappedYearRow> {
    const created = await this.wrappedYear().create({ data });
    return created as unknown as WrappedYearRow;
  }

  async findWrappedYear(userId: string, year: number): Promise<WrappedYearRow | null> {
    const item = await this.wrappedYear().findUnique({
      where: { userId_year: { userId, year } },
      include: { stats: { orderBy: { sortOrder: 'asc' } } },
    });
    return item as unknown as WrappedYearRow | null;
  }

  async findWrappedYearsByUserId(userId: string): Promise<WrappedYearRow[]> {
    const items = await this.wrappedYear().findMany({
      where: { userId },
      orderBy: { year: 'desc' },
      include: { _count: { select: { stats: true } } },
    });
    return items as unknown as WrappedYearRow[];
  }

  async updateWrappedYear(id: string, data: Record<string, unknown>): Promise<WrappedYearRow> {
    const updated = await this.wrappedYear().update({ where: { id }, data });
    return updated as unknown as WrappedYearRow;
  }

  async deleteWrappedYear(id: string, userId: string): Promise<boolean> {
    // Verify ownership BEFORE deleting the children, inside the transaction.
    //
    // The array form of $transaction cannot be used here: a zero-row delete is
    // not an error, so it would commit — deleting another user's stats while
    // their WrappedYear row survived. The interactive form lets us abort.
    return this.prisma
      .$transaction(async (tx) => {
        const yearDelegate = tx.wrappedYear as unknown as {
          deleteMany(args: { where: { id: string; userId: string } }): Promise<{ count: number }>;
        };
        const statDelegate = tx.wrappedStat as unknown as {
          deleteMany(args: { where: { wrappedYearId: string } }): Promise<{ count: number }>;
        };

        const deleted = await yearDelegate.deleteMany({ where: { id, userId } });
        if (deleted.count === 0) throw new WrappedYearNotDeletableError();

        await statDelegate.deleteMany({ where: { wrappedYearId: id } });
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
    const del = this.wrappedStat();
    const createMany = del.createMany;
    if (!createMany) return;

    const deleteOp = del.deleteMany({ where: { wrappedYearId } });
    const createOp = createMany({
      data: stats.map((stat) => ({
        wrappedYearId,
        title: stat.title,
        value: stat.value,
        icon: stat.icon ?? null,
        sortOrder: stat.sortOrder,
      })),
    });
    await this.prisma.$transaction([
      deleteOp as Prisma.PrismaPromise<unknown>,
      createOp as Prisma.PrismaPromise<unknown>,
    ]);
  }
}
