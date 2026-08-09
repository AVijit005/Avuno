import { Injectable, ForbiddenException, Logger } from '@nestjs/common';
import * as nodePath from 'path';
import { UploadService } from './upload.service';
import { ImageService } from './image.service';
import { ImageProcessorService } from './image-processor.service';
import { SignedUrlService } from './signed-url.service';
import { MediaCleanupService } from './media-cleanup.service';
import type { UploadResponseDto, SignedUrlDto, FileInfoDto } from './dto';
import type { StorageFile } from '../core';

const EXTENSION_MIME_MAP: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  constructor(
    private readonly uploadService: UploadService,
    private readonly imageService: ImageService,
    private readonly imageProcessor: ImageProcessorService,
    private readonly signedUrlService: SignedUrlService,
    private readonly cleanupService: MediaCleanupService,
  ) {}

  async upload(file: StorageFile, category: string, userId: string): Promise<UploadResponseDto> {
    return this.uploadService.upload(file, category, userId);
  }

  async uploadAvatar(file: StorageFile, userId: string): Promise<UploadResponseDto> {
    return this.uploadService.uploadAvatar(file, userId);
  }

  async uploadCover(file: StorageFile, userId: string): Promise<UploadResponseDto> {
    return this.uploadService.uploadCover(file, userId);
  }

  async download(path: string): Promise<Buffer> {
    return this.uploadService.download(path);
  }

  async downloadWithMeta(path: string, userId: string): Promise<{ buffer: Buffer; mimeType: string } | null> {
    const normalized = nodePath.normalize(path).replace(/\\/g, '/');
    if (normalized.includes('..')) {
      throw new ForbiddenException('Invalid file path');
    }
    const parts = normalized.split('/');
    if (parts.length >= 3 && parts[1] !== userId) {
      throw new ForbiddenException('You do not have permission to access this file');
    }

    const exists = await this.uploadService.exists(path);
    if (!exists) return null;

    const buffer = await this.uploadService.download(path);
    const ext = '.' + path.split('.').pop()?.toLowerCase();
    const mimeType = EXTENSION_MIME_MAP[ext] ?? 'application/octet-stream';

    return { buffer, mimeType };
  }

  async delete(path: string): Promise<void> {
    await this.uploadService.delete(path);
  }

  async deleteWithOwnershipCheck(path: string, userId: string): Promise<void> {
    // Path format: category/userId/id.ext — verify userId matches
    const normalized = nodePath.normalize(path).replace(/\\/g, '/');
    if (normalized.includes('..')) {
      throw new ForbiddenException('Invalid file path');
    }
    const parts = normalized.split('/');
    if (parts.length < 3 || parts[1] !== userId) {
      throw new ForbiddenException('You do not have permission to delete this file');
    }
    await this.uploadService.delete(path);
  }

  async getFileInfo(path: string): Promise<FileInfoDto | null> {
    try {
      const exists = await this.uploadService.exists(path);
      if (!exists) return null;

      const buffer = await this.uploadService.download(path);
      const ext = '.' + path.split('.').pop()?.toLowerCase();
      const mimeType = EXTENSION_MIME_MAP[ext] ?? 'application/octet-stream';

      return {
        id: path.split('/').pop() ?? 'unknown',
        path,
        mimeType,
        size: buffer.length,
        originalName: path.split('/').pop() ?? 'unknown',
        createdAt: new Date().toISOString(),
      };
    } catch {
      return null;
    }
  }

  generateUploadUrl(path: string, userId: string): SignedUrlDto {
    return this.signedUrlService.generateUploadUrl(path, userId);
  }

  generateDownloadUrl(path: string): SignedUrlDto {
    return this.signedUrlService.generateDownloadUrl(path);
  }

  async cleanupOrphans(): Promise<number> {
    return this.cleanupService.cleanupOrphanedAvatars();
  }

  validate(file: StorageFile, isAvatar = false): string | null {
    return this.imageService.validate(file, isAvatar);
  }
}
