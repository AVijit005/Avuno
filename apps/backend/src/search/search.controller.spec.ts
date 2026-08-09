import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto';

describe('SearchController', () => {
  let controller: SearchController;
  let mockSearchService: any;

  beforeEach(() => {
    mockSearchService = {
      search: mock(async () => ({
        results: [{ id: '1', title: 'The Matrix', type: 'movie' }],
        metadata: { total: 1, limit: 10, offset: 0 },
      })),
      getSuggestions: mock(async () => ['Matrix', 'Matrix Reloaded']),
    };

    controller = new SearchController(mockSearchService as unknown as SearchService);
  });

  describe('search', () => {
    it('calls searchService.search with user id and query', async () => {
      const query: SearchQueryDto = { q: 'matrix', limit: 10, offset: 0 };
      const req = { sub: 'user-1', email: '', role: '' };
      const result = await controller.search(req, query);
      expect(result.results.length).toBe(1);
      expect(mockSearchService.search).toHaveBeenCalledWith('user-1', query);
    });
  });

  describe('suggestions', () => {
    it('calls searchService.getSuggestions', async () => {
      const result = await controller.suggestions({ sub: 'user-1', email: '', role: '' }, 'mat');
      expect(result.length).toBe(2);
      expect(mockSearchService.getSuggestions).toHaveBeenCalledWith('user-1', 'mat', 8);
    });
  });
});
