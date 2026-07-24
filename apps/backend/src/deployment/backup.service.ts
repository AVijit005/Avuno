import { Injectable, Logger } from '@nestjs/common';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export interface BackupResult {
  success: boolean;
  databaseDump?: string;
  mediaArchive?: string;
  sizeBytes?: number;
  error?: string;
}

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  private readonly backupDir: string;

  constructor() {
    this.backupDir = process.env.BACKUP_DIR || './backups';
  }

  private ensureBackupDir(): void {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  async backupDatabase(tag = 'daily'): Promise<BackupResult> {
    this.ensureBackupDir();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `chronicle-db-${tag}-${timestamp}.sql`;
    const filepath = path.join(this.backupDir, filename);

    try {
      const databaseUrl = process.env.DATABASE_URL;
      if (!databaseUrl) throw new Error('DATABASE_URL not set');

      execSync(`pg_dump "${databaseUrl}" > "${filepath}"`, { timeout: 300000 });
      const stats = fs.statSync(filepath);

      this.logger.log(`Database backup: ${filepath} (${stats.size} bytes)`);
      return { success: true, databaseDump: filepath, sizeBytes: stats.size };
    } catch (error) {
      this.logger.error(`Database backup failed: ${error}`);
      return { success: false, error: (error as Error).message };
    }
  }

  async backupMedia(): Promise<BackupResult> {
    this.ensureBackupDir();
    const uploadRoot = process.env.UPLOAD_ROOT || './uploads';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `chronicle-media-${timestamp}.tar.gz`;
    const filepath = path.join(this.backupDir, filename);

    try {
      if (!fs.existsSync(uploadRoot)) throw new Error(`Upload root not found: ${uploadRoot}`);
      execSync(`tar -czf "${filepath}" -C "${path.dirname(uploadRoot)}" "${path.basename(uploadRoot)}"`, {
        timeout: 300000,
      });
      const stats = fs.statSync(filepath);

      this.logger.log(`Media backup: ${filepath} (${stats.size} bytes)`);
      return { success: true, mediaArchive: filepath, sizeBytes: stats.size };
    } catch (error) {
      this.logger.error(`Media backup failed: ${error}`);
      return { success: false, error: (error as Error).message };
    }
  }
}
