import { describe, beforeEach, it, expect, mock, spyOn } from 'bun:test';
import { Test, TestingModule } from '@nestjs/testing';
import { JournalService } from './journal.service';
import { JournalRepository } from './journal.repository';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateMemoryDto } from './dto/journal.dto';
import { JournalEventService } from './journal-event.service';
import { TimelineEventFactory } from './timeline-event-factory';
import { JournalStatisticsService } from './journal-statistics.service';
import { PromptService } from './prompt.service';

describe('Memory Creation (Phase 4C-2)', () => {
  let service: JournalService;
  let repository: any;

  const mockUserId = 'user-a';

  beforeEach(async () => {
    repository = {
      findEntryById: mock(),
      findQuoteById: mock(),
      createMemory: mock(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JournalService,
        { provide: JournalRepository, useValue: repository },
        { provide: JournalEventService, useValue: { emitMemoryCreated: mock() } },
        { provide: TimelineEventFactory, useValue: { createEvent: mock(), fromMemory: mock() } },
        { provide: JournalStatisticsService, useValue: {} },
        { provide: PromptService, useValue: {} },
      ],
    }).compile();

    service = module.get<JournalService>(JournalService);
    // Suppress console error for expected exceptions during tests
    spyOn(console, 'error').mockImplementation(() => {});
  });

  const mockMemoryResponse = (overrides: any = {}) => ({
    id: 'mem-123',
    title: 'Test Memory',
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { media: 0 },
    ...overrides,
  });

  describe('Evidence Rule', () => {
    it('TEST 1: Create Memory without evidence -> PASS', async () => {
      repository.createMemory.mockResolvedValue(mockMemoryResponse({ title: 'No evidence' }));
      const res = await service.createMemory(mockUserId, { title: 'No evidence' } as CreateMemoryDto);
      expect(res.title).toBe('No evidence');
      expect(repository.createMemory).toHaveBeenCalledWith(
        expect.objectContaining({ journalId: undefined, quoteId: undefined }),
      );
    });

    it('TEST 2: Create Memory with Journal evidence -> PASS', async () => {
      repository.findEntryById.mockResolvedValue({
        id: 'j-1',
        userId: mockUserId,
        createdAt: new Date('2026-08-11T10:00:00Z'),
      });
      repository.createMemory.mockResolvedValue(mockMemoryResponse({ journalId: 'j-1' }));
      const res = await service.createMemory(mockUserId, {
        title: 'Journal Evidence',
        journalId: 'j-1',
      } as CreateMemoryDto);
      expect(repository.findEntryById).toHaveBeenCalledWith('j-1', mockUserId);
      expect(res.journalId).toBe('j-1');
    });

    it('TEST 3: Create Memory with Quote evidence -> PASS', async () => {
      repository.findQuoteById.mockResolvedValue({ id: 'q-1', userId: mockUserId });
      repository.createMemory.mockResolvedValue(mockMemoryResponse({ quoteId: 'q-1' }));
      const res = await service.createMemory(mockUserId, {
        title: 'Quote Evidence',
        quoteId: 'q-1',
      } as CreateMemoryDto);
      expect(repository.findQuoteById).toHaveBeenCalledWith('q-1', mockUserId);
      expect(res.quoteId).toBe('q-1');
    });

    it('TEST 4: Create Memory with Journal + Quote -> FAIL', async () => {
      await expect(
        service.createMemory(mockUserId, { title: 'Both', journalId: 'j-1', quoteId: 'q-1' } as CreateMemoryDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Ownership Rule', () => {
    it('TEST 5: User A + User A Journal -> PASS', async () => {
      repository.findEntryById.mockResolvedValue({ id: 'j-1', userId: mockUserId, createdAt: new Date() });
      repository.createMemory.mockResolvedValue(mockMemoryResponse({ journalId: 'j-1' }));
      const res = await service.createMemory(mockUserId, { title: 'Title', journalId: 'j-1' } as CreateMemoryDto);
      expect(res.journalId).toBe('j-1');
    });

    it('TEST 6: User A + User B Journal -> FAIL', async () => {
      // simulate returning null because findEntryById(id, userId) enforces ownership in SQL/Prisma
      repository.findEntryById.mockResolvedValue(null);
      await expect(
        service.createMemory(mockUserId, { title: 'Title', journalId: 'j-user-b' } as CreateMemoryDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('TEST 7: User A + User A Quote -> PASS', async () => {
      repository.findQuoteById.mockResolvedValue({ id: 'q-1', userId: mockUserId });
      repository.createMemory.mockResolvedValue(mockMemoryResponse({ quoteId: 'q-1' }));
      const res = await service.createMemory(mockUserId, { title: 'Title', quoteId: 'q-1' } as CreateMemoryDto);
      expect(res.quoteId).toBe('q-1');
    });

    it('TEST 8: User A + User B Quote -> FAIL', async () => {
      repository.findQuoteById.mockResolvedValue(null);
      await expect(
        service.createMemory(mockUserId, { title: 'Title', quoteId: 'q-user-b' } as CreateMemoryDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('Other Rules', () => {
    it('TEST 9: Private Memory remains private -> PASS', async () => {
      repository.createMemory.mockResolvedValue(mockMemoryResponse({ isPrivate: true }));
      const res = await service.createMemory(mockUserId, { title: 'Title', isPrivate: true } as CreateMemoryDto);
      expect(res.isPrivate).toBe(true);
    });

    it('TEST 10: Created Memory returns correct journalId -> PASS', async () => {
      repository.findEntryById.mockResolvedValue({ id: 'j-x', userId: mockUserId, createdAt: new Date() });
      repository.createMemory.mockResolvedValue(mockMemoryResponse({ journalId: 'j-x' }));
      const res = await service.createMemory(mockUserId, { title: 'Title', journalId: 'j-x' } as CreateMemoryDto);
      expect(res.journalId).toBe('j-x');
    });

    it('TEST 11: Created Memory returns correct quoteId -> PASS', async () => {
      repository.findQuoteById.mockResolvedValue({ id: 'q-x', userId: mockUserId });
      repository.createMemory.mockResolvedValue(mockMemoryResponse({ quoteId: 'q-x' }));
      const res = await service.createMemory(mockUserId, { title: 'Title', quoteId: 'q-x' } as CreateMemoryDto);
      expect(res.quoteId).toBe('q-x');
    });

    it('TEST 12: Journal-created Memory does not duplicate Journal content -> PASS', async () => {
      repository.findEntryById.mockResolvedValue({ id: 'j-1', userId: mockUserId, createdAt: new Date() });
      repository.createMemory.mockResolvedValue(mockMemoryResponse({ description: null }));
      const res = await service.createMemory(mockUserId, { title: 'Title', journalId: 'j-1' } as CreateMemoryDto);
      expect(res.description).toBeNull();
      // Verify create payload did not map journal content to description
      expect(repository.createMemory).toHaveBeenCalledWith(expect.objectContaining({ description: undefined }));
    });

    it('TEST 13: Memory without evidence remains valid -> PASS', async () => {
      repository.createMemory.mockResolvedValue(mockMemoryResponse());
      const res = await service.createMemory(mockUserId, { title: 'Standalone Memory' } as CreateMemoryDto);
      expect(res).toBeDefined();
    });
  });
});
