import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { StorageFile, StorageService } from './storage.abstraction';
import { randomUUID } from 'crypto';

@Injectable()
export class S3StorageService implements StorageService {
  private readonly logger = new Logger(S3StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get<string>('storage.s3.region') || 'auto';
    const endpoint = this.configService.get<string>('storage.s3.endpoint');
    const accessKeyId = this.configService.get<string>('storage.s3.accessKeyId');
    const secretAccessKey = this.configService.get<string>('storage.s3.secretAccessKey');
    this.bucket = this.configService.get<string>('storage.s3.bucket') || 'chronicle';

    if (!accessKeyId || !secretAccessKey) {
      this.logger.warn('S3StorageService is missing AWS credentials. Uploads may fail.');
    }

    this.s3Client = new S3Client({
      region,
      endpoint,
      credentials: {
        accessKeyId: accessKeyId || '',
        secretAccessKey: secretAccessKey || '',
      },
      // Required for some S3-compatible providers like Cloudflare R2 / MinIO
      forcePathStyle: true,
    });
    this.logger.log(`S3 Storage Service initialized for bucket: ${this.bucket}`);
  }

  async upload(path: string, file: StorageFile): Promise<string> {
    const key = path.startsWith('/') ? path.substring(1) : path;
    
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimeType,
      });

      await this.s3Client.send(command);
      this.logger.debug(`File uploaded to S3: ${key}`);
      return key; // We just return the key for storing in DB
    } catch (error) {
      this.logger.error(`Failed to upload file to S3: ${key}`, error);
      throw error;
    }
  }

  async download(path: string): Promise<Buffer> {
    const key = path.startsWith('/') ? path.substring(1) : path;
    
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await this.s3Client.send(command);
      const byteArray = await response.Body?.transformToByteArray();
      if (!byteArray) {
        throw new Error('Response body was empty');
      }
      return Buffer.from(byteArray);
    } catch (error) {
      this.logger.error(`Failed to download file from S3: ${key}`, error);
      throw error;
    }
  }

  async delete(path: string): Promise<void> {
    const key = path.startsWith('/') ? path.substring(1) : path;
    
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.debug(`File deleted from S3: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file from S3: ${key}`, error);
      throw error;
    }
  }

  async exists(path: string): Promise<boolean> {
    const key = path.startsWith('/') ? path.substring(1) : path;
    
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error: any) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        return false;
      }
      this.logger.error(`Failed to check existence in S3: ${key}`, error);
      throw error;
    }
  }
}
