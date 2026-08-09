import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { CollectionsRepository } from './collections.repository';
import type { SmartCollectionConfigDto, CollectionItemResponseDto } from './dto';

interface LibraryItemWithMedia {
  id: string;
  _mediaType?: string;
  createdAt?: Date;
  metadata?: Prisma.InputJsonValue;
  [key: string]: Prisma.InputJsonValue | string | boolean | number | Date | null | undefined;
}

@Injectable()
export class SmartCollectionService {
  constructor(private readonly repository: CollectionsRepository) {}

  async evaluate(userId: string, rules: SmartCollectionConfigDto): Promise<CollectionItemResponseDto[]> {
    if (!rules?.rules?.length) return [];

    const filters: Record<string, unknown> = {};
    const _matchMode = rules.matchMode ?? 'ALL';

    for (const rule of rules.rules) {
      if (rule.field === 'mediaType' || rule.field === 'hasReview') {
        continue;
      }
      if (rule.field === 'status') {
        filters.status = rule.value as string;
      } else if (rule.field === 'rating') {
        filters.rating = this.resolveRatingValue(rule.value);
        filters.ratingOperator = rule.operator;
      } else if (rule.field === 'favorite') {
        filters.favorite = rule.value;
      } else if (rule.field === 'hidden') {
        filters.hidden = rule.value;
      }
    }

    const items = await this.repository.findLibraryItems(userId, filters);

    // Post-filter for hasReview
    let filtered = items;
    for (const rule of rules.rules) {
      if (rule.field === 'hasReview') {
        const shouldHaveReview = rule.value === true;
        filtered = filtered.filter((item) => {
          const metadata = (item.metadata as Prisma.InputJsonValue) ?? {};
          const hasReview = !!(metadata && typeof metadata === 'object' && 'review' in metadata);
          return shouldHaveReview ? hasReview : !hasReview;
        });
      }
    }

    return filtered.map((item) => {
      const mediaType = item._mediaType ?? 'unknown';
      const joined = (item as LibraryItemWithMedia)[mediaType] as Record<string, unknown> | undefined;
      return {
        id: ((item as LibraryItemWithMedia)[`${mediaType}Id`] as string) ?? item.id,
        position: 0,
        note: null,
        addedAt: item.createdAt?.toISOString() ?? new Date().toISOString(),
        mediaId: ((item as LibraryItemWithMedia)[`${mediaType}Id`] as string) ?? item.id,
        mediaType,
        title: (joined?.title as string) ?? 'Unknown',
        slug: (joined?.slug as string) ?? '',
        posterUrl: (joined?.posterUrl as string | null) ?? null,
      };
    });
  }

  private resolveRatingValue(value: unknown): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      // Handle rating like "8" or "4.5"
      const num = parseFloat(value);
      if (!isNaN(num)) return num * 2; // Convert API scale (0.5-5.0) to internal (1-10)
    }
    return 0;
  }
}
