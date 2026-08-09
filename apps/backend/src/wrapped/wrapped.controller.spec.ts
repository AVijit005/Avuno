import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { WrappedController } from './wrapped.controller';
import { WrappedService } from './wrapped.service';

describe('WrappedController', () => {
  let controller: WrappedController;
  let mockWrappedService: any;

  beforeEach(() => {
    mockWrappedService = {
      generate: mock(async () => ({ id: 'w1' })),
      findAll: mock(async () => [{ id: 'w1' }]),
      findOne: mock(async () => ({ id: 'w1' })),
      regenerate: mock(async () => ({ id: 'w1' })),
      getShareData: mock(async () => ({ shareUrl: 'url' })),
      getSummary: mock(async () => ({ id: 'w1' })),
      remove: mock(async () => undefined),
    };

    controller = new WrappedController(mockWrappedService as unknown as WrappedService);
  });

  const req = { sub: 'user-1', email: '', role: '' };

  it('generate calls service generate', async () => {
    await controller.generate(req, 2026);
    expect(mockWrappedService.generate).toHaveBeenCalledWith('user-1', 2026);
  });

  it('findAll calls service findAll', async () => {
    await controller.findAll(req);
    expect(mockWrappedService.findAll).toHaveBeenCalledWith('user-1');
  });

  it('findOne calls service findOne', async () => {
    await controller.findOne(req, '2026');
    expect(mockWrappedService.findOne).toHaveBeenCalledWith('user-1', 2026);
  });

  it('regenerate calls service regenerate', async () => {
    await controller.regenerate(req, '2026');
    expect(mockWrappedService.regenerate).toHaveBeenCalledWith('user-1', 2026);
  });

  it('getShareData calls service getShareData', async () => {
    await controller.getShareData(req, '2026');
    expect(mockWrappedService.getShareData).toHaveBeenCalledWith('user-1', 2026);
  });

  it('getSummary calls service getSummary', async () => {
    await controller.getSummary(req, '2026');
    expect(mockWrappedService.getSummary).toHaveBeenCalledWith('user-1', 2026);
  });

  it('remove calls service remove', async () => {
    await controller.remove(req, '2026');
    expect(mockWrappedService.remove).toHaveBeenCalledWith('user-1', 2026);
  });
});
