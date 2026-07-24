import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { mkdtemp, readFile, rm, stat } from 'fs/promises';
import { tmpdir } from 'os';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import { LocalStorageService } from './local-storage.service';
import { StorageFile } from './storage.abstraction';

describe('LocalStorageService', () => {
  let workDir: string;
  let service: LocalStorageService;

  beforeEach(async () => {
    workDir = await mkdtemp(path.join(tmpdir(), 'chronicle-storage-'));
    const config = {
      get: (key: string) => (key === 'storage.uploadRoot' ? workDir : undefined),
    } as unknown as ConfigService;
    service = new LocalStorageService(config);
  });

  afterEach(async () => {
    await rm(workDir, { recursive: true, force: true });
  });

  it('writes the buffer to the configured upload root and returns the path', async () => {
    const file: StorageFile = {
      buffer: Buffer.from('hello world'),
      mimeType: 'text/plain',
      originalName: 'hello.txt',
    };

    const returned = await service.upload('avatars/user-1/note.txt', file);
    expect(returned).toBe('avatars/user-1/note.txt');

    const absolute = path.join(workDir, 'avatars/user-1/note.txt');
    const onDisk = await readFile(absolute);
    expect(onDisk.toString()).toBe('hello world');
  });

  it('creates nested directories that do not yet exist', async () => {
    const file: StorageFile = {
      buffer: Buffer.from([1, 2, 3]),
      mimeType: 'application/octet-stream',
      originalName: 'blob.bin',
    };

    await service.upload('a/b/c/d/blob.bin', file);
    const stats = await stat(path.join(workDir, 'a/b/c/d/blob.bin'));
    expect(stats.isFile()).toBe(true);
  });

  it('downloads what was uploaded', async () => {
    const file: StorageFile = {
      buffer: Buffer.from('round-trip'),
      mimeType: 'text/plain',
      originalName: 'note.txt',
    };
    await service.upload('folder/note.txt', file);
    const downloaded = await service.download('folder/note.txt');
    expect(downloaded.toString()).toBe('round-trip');
  });

  it('exists returns true after upload and false after delete', async () => {
    const file: StorageFile = {
      buffer: Buffer.from('present'),
      mimeType: 'text/plain',
      originalName: 'present.txt',
    };
    await service.upload('folder/present.txt', file);
    expect(await service.exists('folder/present.txt')).toBe(true);

    await service.delete('folder/present.txt');
    expect(await service.exists('folder/present.txt')).toBe(false);
  });

  it('delete swallows ENOENT for missing paths', async () => {
    await expect(service.delete('does/not/exist.bin')).resolves.toBeUndefined();
  });

  it('rejects absolute or escaping paths', () => {
    const file: StorageFile = {
      buffer: Buffer.from('x'),
      mimeType: 'text/plain',
      originalName: 'x.txt',
    };
    expect(service.upload('/etc/passwd', file)).rejects.toThrow(/Invalid storage path/);
    expect(service.upload('../escape.txt', file)).rejects.toThrow(/Invalid storage path/);
  });

  it('falls back to ./uploads when config is missing', async () => {
    const fallbackWork = await mkdtemp(path.join(tmpdir(), 'chronicle-fallback-'));
    const previousCwd = process.cwd();
    process.chdir(fallbackWork);
    try {
      const config = { get: () => undefined } as unknown as ConfigService;
      const fallbackService = new LocalStorageService(config);
      const file: StorageFile = {
        buffer: Buffer.from('fallback'),
        mimeType: 'text/plain',
        originalName: 'f.txt',
      };
      await fallbackService.upload('nested/f.txt', file);
      const stats = await stat(path.join(fallbackWork, 'uploads/nested/f.txt'));
      expect(stats.isFile()).toBe(true);
    } finally {
      process.chdir(previousCwd);
      await rm(fallbackWork, { recursive: true, force: true });
    }
  });
});
