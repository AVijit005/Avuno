/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { WrappedService } from './wrapped.service';

describe('WrappedService', () => {
  let service: WrappedService;
  let repoMock: {
    createWrappedYear: ReturnType<typeof mock>;
    findWrappedYear: ReturnType<typeof mock>;
    findWrappedYearsByUserId: ReturnType<typeof mock>;
    updateWrappedYear: ReturnType<typeof mock>;
    deleteWrappedYear: ReturnType<typeof mock>;
    upsertStats: ReturnType<typeof mock>;
  };
  let generatorMock: { generate: ReturnType<typeof mock> };
  let shareMock: { buildSharePayload: ReturnType<typeof mock> };

  const mockWrapped = {
    id: 'wrap-1',
    userId: 'user-1',
    year: 2024,
    generatedAt: new Date('2024-12-31'),
    metadata: {
      cards: [],
      stats: [],
      insights: [],
      summary: 'Your 2024 Chronicle Wrapped is ready.',
      version: 1,
      sharePayload: {},
    },
    stats: [],
  };

  beforeEach(() => {
    repoMock = {
      createWrappedYear: mock(() => Promise.resolve({ ...mockWrapped })),
      findWrappedYear: mock(() => Promise.resolve(null)),
      findWrappedYearsByUserId: mock(() =>
        Promise.resolve([
          { id: 'wrap-1', year: 2024, generatedAt: new Date(), metadata: { version: 1 }, _count: { stats: 0 } },
        ]),
      ),
      updateWrappedYear: mock(() => Promise.resolve({ ...mockWrapped })),
      deleteWrappedYear: mock(() => Promise.resolve(true)),
      upsertStats: mock(() => Promise.resolve()),
    };

    generatorMock = {
      generate: mock(() =>
        Promise.resolve({
          cards: [],
          stats: [],
          insights: [],
          summary: 'Your 2024 Chronicle Wrapped is ready.',
          sharePayload: {},
        }),
      ),
    };

    shareMock = {
      buildSharePayload: mock(() => ({
        id: 'wrap-1',
        year: 2024,
        summary: 'Test',
        highlights: [],
        topCards: [],
        stats: [],
      })),
    };

    service = new WrappedService(repoMock as any, generatorMock as any, shareMock as any);
  });

  it('generates a wrapped recap', async () => {
    const result = await service.generate('user-1', 2024);
    expect(result.year).toBe(2024);
    expect(repoMock.createWrappedYear).toHaveBeenCalledTimes(1);
  });

  it('throws ConflictException on duplicate generation', async () => {
    repoMock.findWrappedYear.mockResolvedValueOnce({ ...mockWrapped });
    try {
      await service.generate('user-1', 2024);
      expect.unreachable();
    } catch (err) {
      expect((err as Error).message).toContain('already exists');
    }
  });

  it('regenerates a wrapped recap', async () => {
    repoMock.findWrappedYear.mockResolvedValueOnce({ ...mockWrapped });
    const result = await service.regenerate('user-1', 2024);
    expect(result.year).toBe(2024);
    expect(repoMock.updateWrappedYear).toHaveBeenCalledTimes(1);
  });

  it('finds all wrapped recaps', async () => {
    const result = await service.findAll('user-1');
    expect(result).toHaveLength(1);
    expect(result[0].year).toBe(2024);
  });

  it('finds one wrapped recap', async () => {
    repoMock.findWrappedYear.mockResolvedValueOnce({ ...mockWrapped });
    const result = await service.findOne('user-1', 2024);
    expect(result.year).toBe(2024);
  });

  it('throws on missing wrapped', async () => {
    try {
      await service.findOne('user-1', 2023);
      expect.unreachable();
    } catch (err) {
      expect((err as Error).message).toContain('No wrapped for');
    }
  });

  it('returns share data', async () => {
    repoMock.findWrappedYear.mockResolvedValueOnce({ ...mockWrapped });
    const result = await service.getShareData('user-1', 2024);
    expect(result.id).toBe('wrap-1');
  });

  it('deletes a wrapped recap', async () => {
    repoMock.findWrappedYear.mockResolvedValueOnce({ ...mockWrapped });
    await service.remove('user-1', 2024);
    expect(repoMock.deleteWrappedYear).toHaveBeenCalledWith('wrap-1', 'user-1');
  });
});
