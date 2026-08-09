import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { StorageService } from './storage.service';
import { UploadService } from './upload.service';
import { ImageService } from './image.service';
import { ImageProcessorService } from './image-processor.service';
import { SignedUrlService } from './signed-url.service';
import { MediaCleanupService } from './media-cleanup.service';
import { ForbiddenException } from '@nestjs/common';

describe('StorageService', () => {
  let service: StorageService;
  let mockUpload: any;
  let mockImage: any;
  let mockProcessor: any;
  let mockSigned: any;
  let mockCleanup: any;

  beforeEach(() => {
    mockUpload = {
      upload: mock(async () => ({ url: 'test.jpg' })),
      uploadAvatar: mock(async () => ({ url: 'avatar.jpg' })),
      uploadCover: mock(async () => ({ url: 'cover.jpg' })),
      download: mock(async () => Buffer.from('test')),
      exists: mock(async () => true),
      delete: mock(async () => {}),
    };
    mockImage = {
      validate: mock(() => null),
    };
    mockProcessor = {};
    mockSigned = {
      generateUploadUrl: mock(() => ({ url: 'http://upload' })),
      generateDownloadUrl: mock(() => ({ url: 'http://download' })),
    };
    mockCleanup = {
      cleanupOrphanedAvatars: mock(async () => 5),
    };

    service = new StorageService(
      mockUpload as UploadService,
      mockImage as ImageService,
      mockProcessor as ImageProcessorService,
      mockSigned as SignedUrlService,
      mockCleanup as MediaCleanupService,
    );
  });

  it('delegates upload methods', async () => {
    const file = { buffer: Buffer.from(''), originalname: 'test.jpg', mimetype: 'image/jpeg', size: 10 } as any;

    await service.upload(file, 'test', 'user-1');
    expect(mockUpload.upload).toHaveBeenCalledWith(file, 'test', 'user-1');

    await service.uploadAvatar(file, 'user-1');
    expect(mockUpload.uploadAvatar).toHaveBeenCalledWith(file, 'user-1');
  });

  describe('downloadWithMeta', () => {
    it('downloads file with correct mime type', async () => {
      const result = await service.downloadWithMeta('category/user-1/test.jpg', 'user-1');
      expect(result?.mimeType).toBe('image/jpeg');
      expect(mockUpload.download).toHaveBeenCalled();
    });

    it('throws ForbiddenException if path traversal is attempted', async () => {
      await expect(service.downloadWithMeta('../test.jpg', 'user-1')).rejects.toThrow(ForbiddenException);
    });

    it('throws ForbiddenException if user tries to access another users file', async () => {
      await expect(service.downloadWithMeta('category/user-2/test.jpg', 'user-1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteWithOwnershipCheck', () => {
    it('deletes file if user owns it', async () => {
      await service.deleteWithOwnershipCheck('category/user-1/test.jpg', 'user-1');
      expect(mockUpload.delete).toHaveBeenCalledWith('category/user-1/test.jpg');
    });

    it('throws ForbiddenException if user tries to delete another users file', async () => {
      await expect(service.deleteWithOwnershipCheck('category/user-2/test.jpg', 'user-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  it('generates signed urls', () => {
    service.generateUploadUrl('path', 'user-1');
    expect(mockSigned.generateUploadUrl).toHaveBeenCalled();

    service.generateDownloadUrl('path');
    expect(mockSigned.generateDownloadUrl).toHaveBeenCalled();
  });

  it('cleans up orphans', async () => {
    const count = await service.cleanupOrphans();
    expect(count).toBe(5);
    expect(mockCleanup.cleanupOrphanedAvatars).toHaveBeenCalled();
  });
});
