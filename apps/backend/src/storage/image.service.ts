import { Injectable, Logger } from '@nestjs/common';
import type { StorageFile } from '../core';

export interface ImageInfo {
  width: number;
  height: number;
  format: string;
  size: number;
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'] as const;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2 MB
// TODO: not yet enforced — no dimension check runs on upload, so the
// decompression-bomb protection this implies does not exist.
export const MAX_DIMENSION = 16384;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

// Reserved filenames on Windows
const RESERVED_NAMES = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\.|$)/i;

@Injectable()
export class ImageService {
  private readonly logger = new Logger(ImageService.name);

  validate(file: StorageFile, isAvatar = false): string | null {
    // 1. Empty file check
    if (!file.buffer || file.buffer.length === 0) {
      return 'File is empty';
    }

    // 2. Size check
    const maxSize = isAvatar ? MAX_AVATAR_SIZE : MAX_FILE_SIZE;
    if (file.buffer.length > maxSize) {
      return `File size exceeds ${Math.round((maxSize / 1024 / 1024) * 10) / 10} MB limit`;
    }

    // 3. SVG rejection (dangerous — embedded scripts, event handlers, external references)
    if (this.isSvgContent(file.buffer)) {
      return 'SVG files are not allowed for security reasons';
    }

    // 4. MIME type allowlist check
    if (!ALLOWED_MIME_TYPES.includes(file.mimeType as AllowedMimeType)) {
      return `Invalid file type. Allowed: JPEG, PNG, WebP, AVIF, GIF`;
    }

    // 5. Magic byte validation — verify file signature matches claimed MIME type
    const signatureMime = this.detectMimeTypeFromSignature(file.buffer);
    if (!signatureMime) {
      return 'Unrecognized file format — file may be corrupted';
    }
    if (signatureMime !== file.mimeType) {
      this.logger.warn(`MIME type mismatch: claimed "${file.mimeType}" but signature indicates "${signatureMime}"`);
      return 'File content does not match the declared file type';
    }

    return null;
  }

  isAllowedMimeType(mimeType: string): boolean {
    return ALLOWED_MIME_TYPES.includes(mimeType as AllowedMimeType);
  }

  getExtension(mimeType: string): string {
    const map: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/avif': '.avif',
      'image/gif': '.gif',
    };
    return map[mimeType] ?? '.bin';
  }

  /**
   * Sanitize filename to prevent:
   * - Directory traversal (../, ..\)
   * - Double extensions (.jpg.php)
   * - Hidden extensions (.htaccess)
   * - Unicode tricks (RTL override, zero-width chars)
   * - Reserved filenames (CON, PRN, AUX, NUL, COM1-9, LPT1-9)
   * - Path injection
   */
  sanitizeFilename(name: string): string {
    let sanitized = name;

    // Strip path separators and null bytes. The NUL is deliberate — a
    // filename containing it can truncate paths in downstream C APIs.
    // eslint-disable-next-line no-control-regex
    sanitized = sanitized.replace(/[/\\:\x00]/g, '_');

    // Strip Unicode control characters (RTL override, zero-width, etc.)
    sanitized = sanitized.replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, '');

    // Remove leading dots (hidden files)
    sanitized = sanitized.replace(/^\.+/, '');

    // Collapse multiple dots to prevent double extensions
    // Allow one dot for the extension
    const lastDot = sanitized.lastIndexOf('.');
    if (lastDot > 0) {
      const base = sanitized.slice(0, lastDot).replace(/\./g, '_');
      const ext = sanitized.slice(lastDot);
      sanitized = base + ext;
    }

    // Remove reserved Windows filenames
    if (RESERVED_NAMES.test(sanitized)) {
      sanitized = '_' + sanitized;
    }

    // Allow only safe characters
    sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_');

    // Collapse multiple underscores
    sanitized = sanitized.replace(/_+/g, '_');

    // Trim and limit length
    sanitized = sanitized.slice(0, 200);

    // Ensure non-empty
    return sanitized || 'upload';
  }

  /**
   * Detect MIME type from file magic bytes (first 12 bytes).
   * Returns null if signature is not recognized.
   */
  private detectMimeTypeFromSignature(buffer: Buffer): string | null {
    if (buffer.length < 4) return null;

    // JPEG: FF D8 FF
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return 'image/jpeg';
    }

    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (
      buffer.length >= 8 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    ) {
      return 'image/png';
    }

    // GIF: GIF87a or GIF89a
    if (
      buffer.length >= 6 &&
      buffer[0] === 0x47 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x38 &&
      (buffer[4] === 0x37 || buffer[4] === 0x39) &&
      buffer[5] === 0x61
    ) {
      return 'image/gif';
    }

    // WebP: RIFF....WEBP
    if (
      buffer.length >= 12 &&
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46 &&
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50
    ) {
      return 'image/webp';
    }

    // AVIF/HEIF: ftyp box at offset 4
    if (buffer.length >= 12 && buffer[4] === 0x66 && buffer[5] === 0x74 && buffer[6] === 0x79 && buffer[7] === 0x70) {
      // Check for AVIF brand
      const brand = buffer.slice(8, 12).toString('ascii');
      if (brand === 'avif' || brand === 'avis' || brand === 'heic' || brand === 'heix') {
        return 'image/avif';
      }
      // ftyp present but not AVIF — could be MP4 or other ISO media
      return null;
    }

    // SVG: check for XML/SVG content
    if (this.isSvgContent(buffer)) {
      return 'image/svg+xml';
    }

    return null;
  }

  /**
   * Detect SVG content by checking for XML declaration or <svg tag.
   * SVG files are dangerous (embedded scripts, event handlers, external refs).
   */
  private isSvgContent(buffer: Buffer): boolean {
    // Check first 1KB for SVG signatures
    const head = buffer.slice(0, 1024).toString('utf-8').trim().toLowerCase();

    // XML declaration followed by svg
    if (head.startsWith('<?xml') && head.includes('<svg')) {
      return true;
    }

    // Direct SVG tag
    if (head.startsWith('<svg')) {
      return true;
    }

    // SVG with DOCTYPE
    if (head.includes('<!doctype') && head.includes('svg')) {
      return true;
    }

    return false;
  }
}
