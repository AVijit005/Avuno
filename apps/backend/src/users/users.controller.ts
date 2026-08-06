import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { AccessTokenPayload } from '../auth/services/jwt-token.service';
import { CookieService } from '../auth/services/cookie.service';
import { UpdatePreferencesDto, UpdatePrivacyDto, UpdateProfileDto } from './dto';
import { RequestMetadata, UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(
    private readonly users: UsersService,
    private readonly cookies: CookieService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('me')
  getMe(@CurrentUser() user: AccessTokenPayload) {
    return this.users.getMe(user.sub);
  }

  @Patch('me')
  updateProfile(@CurrentUser() user: AccessTokenPayload, @Body() dto: UpdateProfileDto, @Req() req: Request) {
    return this.users.updateProfile(user.sub, dto, this.metadata(req));
  }

  @Patch('me/preferences')
  updatePreferences(@CurrentUser() user: AccessTokenPayload, @Body() dto: UpdatePreferencesDto, @Req() req: Request) {
    return this.users.updatePreferences(user.sub, dto, this.metadata(req));
  }

  @Patch('me/privacy')
  updatePrivacy(@CurrentUser() user: AccessTokenPayload, @Body() dto: UpdatePrivacyDto, @Req() req: Request) {
    return this.users.updatePrivacy(user.sub, dto, this.metadata(req));
  }

  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  updateAvatar(
    @CurrentUser() user: AccessTokenPayload,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /.(jpg|jpeg|png|webp)$/i, fallbackToMimetype: true }),
        ],
      }),
    )
    file: { buffer: Buffer; mimetype: string; originalname: string; size: number },
    @Req() req: Request,
  ) {
    return this.users.updateAvatar(
      user.sub,
      {
        buffer: file.buffer,
        mimeType: file.mimetype,
        originalName: file.originalname,
        size: file.size,
      },
      this.metadata(req),
    );
  }

  @Delete('me/avatar')
  deleteAvatar(@CurrentUser() user: AccessTokenPayload, @Req() req: Request) {
    return this.users.deleteAvatar(user.sub, this.metadata(req));
  }

  @Get('me/sessions')
  listSessions(@CurrentUser() user: AccessTokenPayload, @Req() req: Request) {
    const refreshToken = this.cookies.readRefreshToken(req);
    return this.users.listSessions(user.sub, refreshToken);
  }

  @Delete('me/sessions/:id')
  revokeSession(@CurrentUser() user: AccessTokenPayload, @Param('id') sessionId: string) {
    return this.users.revokeSession(user.sub, sessionId);
  }

  @Get('admin/metrics')
  @Roles(UserRole.ADMIN)
  async getAdminMetrics() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const [total, active] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { lastLoginAt: { gte: thirtyDaysAgo } } }),
    ]);
    return { usersCount: total, activeUsers: active };
  }

  private metadata(req: Request): RequestMetadata {
    const userAgentHeader = req.headers['user-agent'];
    const userAgent = Array.isArray(userAgentHeader) ? userAgentHeader[0] : userAgentHeader;
    return {
      ipAddress: req.ip,
      userAgent,
    };
  }
}
