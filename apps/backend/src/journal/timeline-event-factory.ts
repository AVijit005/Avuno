import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { asHost, delegate, type QueryableDelegate } from '../common/prisma-delegates';

export interface AutoTimelineEvent {
  type: string;
  title: string;
  description: string | null;
  eventDate: Date;
  icon: string | null;
  color: string | null;
  metadata: Prisma.InputJsonValue;
}

@Injectable()
export class TimelineEventFactory {
  constructor(private readonly prisma: PrismaService) {}

  private host(): ReturnType<typeof asHost> {
    return asHost(this.prisma);
  }

  private timelineEvent(): QueryableDelegate {
    return delegate(this.host(), 'timelineEvent');
  }

  async createEvent(userId: string, data: AutoTimelineEvent): Promise<void> {
    await this.timelineEvent().create({
      data: {
        userId,
        type: data.type,
        title: data.title,
        description: data.description,
        eventDate: data.eventDate,
        icon: data.icon,
        color: data.color,
        metadata: data.metadata ?? {},
      },
    });
  }

  fromProgressCompleted(userId: string, libraryId: string, mediaType: string, title: string): AutoTimelineEvent {
    return {
      type: 'COMPLETED',
      title: `Completed ${title}`,
      description: `Finished watching/reading/playing ${title}`,
      eventDate: new Date(),
      icon: 'check-circle',
      color: '#22c55e',
      metadata: { libraryId, mediaType },
    };
  }

  fromRating(userId: string, libraryId: string, mediaType: string, rating: number, title: string): AutoTimelineEvent {
    return {
      type: 'RATED',
      title: `Rated ${title}`,
      description: `Gave ${title} a rating of ${rating}/5`,
      eventDate: new Date(),
      icon: 'star',
      color: '#f59e0b',
      metadata: { libraryId, mediaType, rating },
    };
  }

  fromFavorite(userId: string, libraryId: string, mediaType: string, title: string): AutoTimelineEvent {
    return {
      type: 'FAVORITED',
      title: `Favorited ${title}`,
      description: `Added ${title} to favorites`,
      eventDate: new Date(),
      icon: 'heart',
      color: '#ef4444',
      metadata: { libraryId, mediaType },
    };
  }

  fromCollectionCreated(userId: string, collectionId: string, name: string): AutoTimelineEvent {
    return {
      type: 'COLLECTION_CREATED',
      title: `Created collection "${name}"`,
      description: `Started a new collection: ${name}`,
      eventDate: new Date(),
      icon: 'folder',
      color: '#3b82f6',
      metadata: { collectionId },
    };
  }

  fromJournalEntry(userId: string, entryId: string, title: string): AutoTimelineEvent {
    return {
      type: 'JOURNAL_CREATED',
      title: 'Journal entry written',
      description: title ? `Wrote: ${title}` : 'Wrote a journal entry',
      eventDate: new Date(),
      icon: 'book-open',
      color: '#8b5cf6',
      metadata: { entryId, journalTitle: title },
    };
  }

  fromMemory(userId: string, memoryId: string, title: string): AutoTimelineEvent {
    return {
      type: 'MEMORY_CREATED',
      title: `Memory: ${title}`,
      description: `Created a memory: ${title}`,
      eventDate: new Date(),
      icon: 'camera',
      color: '#ec4899',
      metadata: { memoryId },
    };
  }

  fromQuote(userId: string, quoteId: string, content: string): AutoTimelineEvent {
    const snippet = content.length > 80 ? content.slice(0, 80) + '...' : content;
    return {
      type: 'QUOTE_ADDED',
      title: 'Saved a quote',
      description: `"${snippet}"`,
      eventDate: new Date(),
      icon: 'quote',
      color: '#14b8a6',
      metadata: { quoteId },
    };
  }

  fromHighlight(userId: string, highlightId: string, title: string): AutoTimelineEvent {
    return {
      type: 'HIGHLIGHT_ADDED',
      title: `Highlight: ${title}`,
      description: `Saved a highlight: ${title}`,
      eventDate: new Date(),
      icon: 'highlighter',
      color: '#f97316',
      metadata: { highlightId },
    };
  }
}
