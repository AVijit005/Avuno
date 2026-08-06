import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import type { Response } from 'express';
import { CurrentUser, JwtAuthGuard } from '../auth';
import type { AccessTokenPayload } from '../auth/services/jwt-token.service';
import { StorageService } from './storage.service';
import { SignedUrlService } from './signed-url.service';
import type { UploadResponseDto, SignedUrlDto } from './dto';

@ApiTags('Storage')
@Controller('storage')
export class StorageController {
  constructor(
    private readonly storageService: StorageService,
    private readonly signedUrlService: SignedUrlService,
  ) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @CurrentUser() user: AccessTokenPayload,
    @UploadedFile() file: any,
    @Query('category') category: string,
  ): Promise<UploadResponseDto> {
    if (!file) throw new BadRequestException('No file provided');
    return this.storageService.upload(
      { buffer: file.buffer, mimeType: file.mimetype, originalName: file.originalname },
      category || 'uploads',
      user.sub,
    );
  }

  @Post('upload/multipart')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Upload multiple files' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadMultipart(
    @CurrentUser() user: AccessTokenPayload,
    @UploadedFiles() files: any[],
    @Query('category') category: string,
  ): Promise<UploadResponseDto[]> {
    return Promise.all(
      files.map((f) =>
        this.storageService.upload(
          { buffer: f.buffer, mimeType: f.mimetype, originalName: f.originalname },
          category || 'uploads',
          user.sub,
        ),
      ),
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Download a file' })
  async download(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id') id: string,
    @Query('token') token?: string,
    @Query('exp') exp?: string,
    @Res() res?: Response,
  ): Promise<void> {
    if (token && exp) {
      const isValid = this.signedUrlService.verifyDownloadToken(token, id, parseInt(exp, 10));
      if (!isValid && res) {
        res.status(403).json({ statusCode: 403, message: 'Invalid or expired signed URL token' });
        return;
      }
    }
    const file = await this.storageService.downloadWithMeta(id, user.sub);
    if (!file && res) {
      res.status(404).json({ statusCode: 404, message: 'File not found' });
      return;
    }

    if (res && file) {
      res.set('Content-Type', file.mimeType || 'application/octet-stream');
      res.set('Content-Length', String(file.buffer.length));
      res.set('Cache-Control', 'private, max-age=3600');
      res.send(file.buffer);
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a file' })
  async delete(@CurrentUser() user: AccessTokenPayload, @Param('id') id: string): Promise<void> {
    await this.storageService.deleteWithOwnershipCheck(id, user.sub);
  }

  @Post('signed-url')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Generate a signed upload URL' })
  async generateSignedUrl(@CurrentUser() user: AccessTokenPayload, @Query('path') path: string): Promise<SignedUrlDto> {
    return this.signedUrlService.generateUploadUrl(path, user.sub);
  }

  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Upload an avatar' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(@CurrentUser() user: AccessTokenPayload, @UploadedFile() file: any): Promise<UploadResponseDto> {
    if (!file) throw new BadRequestException('No file provided');
    return this.storageService.uploadAvatar(
      { buffer: file.buffer, mimeType: file.mimetype, originalName: file.originalname },
      user.sub,
    );
  }

  @Post('cover')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Upload a cover image' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCover(@CurrentUser() user: AccessTokenPayload, @UploadedFile() file: any): Promise<UploadResponseDto> {
    if (!file) throw new BadRequestException('No file provided');
    return this.storageService.uploadCover(
      { buffer: file.buffer, mimeType: file.mimetype, originalName: file.originalname },
      user.sub,
    );
  }
}
