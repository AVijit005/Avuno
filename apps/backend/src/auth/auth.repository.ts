import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { BaseRepository } from '../core';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthRepository extends BaseRepository<User> {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.user.count({ where: { id } });
    return count > 0;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  }

  async emailExists(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({ where: { email: email.toLowerCase().trim() } });
    return count > 0;
  }

  async create(data: { email: string; passwordHash: string; name?: string | null }): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: data.email.toLowerCase().trim(),
        passwordHash: data.passwordHash,
        name: data.name ?? null,
        status: 'PENDING_VERIFICATION',
        emailVerified: false,
      },
    });
  }

  async createOAuthUser(data: { email: string; displayName?: string | null; emailVerified?: boolean }): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: data.email.toLowerCase().trim(),
        passwordHash: null,
        name: data.displayName ?? null,
        status: 'ACTIVE',
        emailVerified: data.emailVerified ?? false,
      },
    });
  }

  async save(entity: User): Promise<User> {
    const { id, ...rest } = entity;
    return this.prisma.user.update({
      where: { id },
      data: rest as Prisma.UserUncheckedUpdateInput,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  /** Used to transparently upgrade a legacy hash after a successful login. */
  async updatePasswordHash(id: string, passwordHash: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
  }
}
