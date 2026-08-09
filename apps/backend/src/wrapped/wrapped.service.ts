/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { WrappedRepository } from './wrapped.repository';
import { WrappedGeneratorService } from './wrapped-generator.service';
import { WrappedShareService } from './wrapped-share.service';
import type { WrappedDto, WrappedSummaryDto, WrappedShareDto } from './dto';

@Injectable()
export class WrappedService {
  constructor(
    private readonly repository: WrappedRepository,
    private readonly generator: WrappedGeneratorService,
    private readonly shareService: WrappedShareService,
  ) {}

  async generate(userId: string, year: number): Promise<WrappedDto> {
    const existing = await this.repository.findWrappedYear(userId, year);
    if (existing) {
      throw new ConflictException(`Wrapped for ${year} already exists. Use regenerate to create a new version.`);
    }

    const { cards, stats, insights, summary, sharePayload, totalCompleted, totalHours, journalCount } =
      await this.generator.generate(userId, year);

    const metadata = {
      cards,
      insights,
      summary,
      sharePayload,
      totalCompleted,
      totalHours,
      totalJournalEntries: journalCount,
      version: 1,
    };
    const wrappedYear = await this.repository.createWrappedYear({
      userId,
      year,
      metadata,
    });

    await this.repository.upsertStats(
      wrappedYear.id,
      stats.map((s) => ({ title: s.title, value: s.value, icon: s.icon ?? undefined, sortOrder: s.sortOrder })),
    );

    return this.toWrappedDto(wrappedYear, cards, stats, insights, summary, 1);
  }

  async regenerate(userId: string, year: number): Promise<WrappedDto> {
    const existing = await this.repository.findWrappedYear(userId, year);
    if (!existing) {
      throw new NotFoundException(`No wrapped for ${year} found. Generate first.`);
    }

    const oldMeta = (existing.metadata ?? {}) as Record<string, any>;
    const nextVersion = (oldMeta.version ?? 1) + 1;

    const { cards, stats, insights, summary, sharePayload, totalCompleted, totalHours, journalCount } =
      await this.generator.generate(userId, year);

    const metadata = {
      cards,
      insights,
      summary,
      sharePayload,
      totalCompleted,
      totalHours,
      totalJournalEntries: journalCount,
      version: nextVersion,
    };
    const updated = await this.repository.updateWrappedYear(existing.id, {
      metadata,
      generatedAt: new Date(),
      coverImage: null,
    });

    await this.repository.upsertStats(
      existing.id,
      stats.map((s, i) => ({ title: s.title, value: s.value, icon: s.icon ?? undefined, sortOrder: i + 1 })),
    );

    return this.toWrappedDto(updated, cards, stats, insights, summary, nextVersion);
  }

  async findAll(userId: string): Promise<WrappedSummaryDto[]> {
    const items = await this.repository.findWrappedYearsByUserId(userId);
    return items.map((item: any) => {
      const meta = (item.metadata ?? {}) as Record<string, any>;
      return {
        id: item.id,
        year: item.year,
        generatedAt: item.generatedAt?.toISOString() ?? '',
        version: meta.version ?? 1,
        totalCompleted: meta.totalCompleted ?? 0,
        totalHours: meta.totalHours ?? 0,
        totalJournalEntries: meta.totalJournalEntries ?? 0,
      };
    });
  }

  async findOne(userId: string, year: number): Promise<WrappedDto> {
    const wrapped = await this.repository.findWrappedYear(userId, year);
    if (!wrapped) throw new NotFoundException(`No wrapped for ${year} found`);

    const meta = (wrapped.metadata ?? {}) as Record<string, any>;
    return this.toWrappedDto(
      wrapped,
      meta.cards ?? [],
      this.mapStatsFromDb(wrapped.stats ?? []),
      meta.insights ?? [],
      meta.summary ?? '',
      meta.version ?? 1,
    );
  }

  async getShareData(userId: string, year: number): Promise<WrappedShareDto> {
    const wrapped = await this.repository.findWrappedYear(userId, year);
    if (!wrapped) throw new NotFoundException(`No wrapped for ${year} found`);

    const meta = (wrapped.metadata ?? {}) as Record<string, any>;
    const stats = this.mapStatsFromDb(wrapped.stats ?? []);
    const cards: any[] = meta.cards ?? [];
    const insights: any[] = meta.insights ?? [];
    const summary: string = meta.summary ?? '';

    return this.shareService.buildSharePayload(wrapped.id, year, summary, insights, cards, stats);
  }

  async getSummary(userId: string, year: number): Promise<WrappedSummaryDto> {
    const wrapped = await this.repository.findWrappedYear(userId, year);
    if (!wrapped) throw new NotFoundException(`No wrapped for ${year} found`);

    const meta = (wrapped.metadata ?? {}) as Record<string, any>;
    return {
      id: wrapped.id,
      year: wrapped.year,
      generatedAt: wrapped.generatedAt?.toISOString() ?? '',
      version: meta.version ?? 1,
      totalCompleted: meta.totalCompleted ?? 0,
      totalHours: meta.totalHours ?? 0,
      totalJournalEntries: meta.totalJournalEntries ?? 0,
    };
  }

  async remove(userId: string, year: number): Promise<void> {
    const wrapped = await this.repository.findWrappedYear(userId, year);
    if (!wrapped) throw new NotFoundException(`No wrapped for ${year} found`);

    await this.repository.deleteWrappedYear(wrapped.id, userId);
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private toWrappedDto(
    wrapped: any,
    cards: any[],
    stats: any[],
    insights: any[],
    summary: string,
    version: number,
  ): WrappedDto {
    const sharePayload = wrapped.metadata?.sharePayload ?? {
      year: wrapped.year,
      stats: stats.slice(0, 10),
      insights: insights.slice(0, 5),
    };

    return {
      id: wrapped.id,
      userId: wrapped.userId,
      year: wrapped.year,
      generatedAt: wrapped.generatedAt?.toISOString() ?? '',
      version,
      cards,
      stats,
      insights,
      summary,
      sharePayload,
    };
  }

  private mapStatsFromDb(dbStats: any[]): any[] {
    return dbStats.map((s: any) => ({
      title: s.title,
      value: s.value,
      icon: s.icon ?? null,
      sortOrder: s.sortOrder,
    }));
  }
}
