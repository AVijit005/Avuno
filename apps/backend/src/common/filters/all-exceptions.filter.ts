import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import type { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import * as Sentry from '@sentry/nestjs';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const requestId = request['id'] as string | undefined;
    const { status, message, code } = this.resolveError(exception);

    this.logger.error({
      requestId,
      status,
      code,
      message,
      path: request.url,
      method: request.method,
      stack: exception instanceof Error ? exception.stack : undefined,
    });

    const body: Record<string, unknown> = {
      statusCode: status,
      message,
      requestId,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Only expose safe, user-facing error codes
    const safeCodes = ['UNIQUE_VIOLATION', 'RECORD_NOT_FOUND', 'VALIDATION_ERROR'];
    if (code && safeCodes.includes(code)) {
      body.code = code;
    }

    response.status(status).json(body);
  }

  private resolveError(exception: unknown): { status: number; message: string | string[]; code?: string } {
    if (process.env.SENTRY_DSN) {
      Sentry.captureException(exception);
    }

    // HttpException — use as-is
    if (exception instanceof HttpException) {
      const resp = exception.getResponse();
      const message =
        typeof resp === 'string'
          ? resp
          : (resp as { message?: string | string[] }).message || exception.message;
      return { status: exception.getStatus(), message };
    }

    // Prisma known errors — translate to domain-appropriate HTTP codes
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.handlePrismaError(exception);
    }

    // Prisma validation errors — client sent bad data
    if (exception instanceof Prisma.PrismaClientValidationError) {
      return { status: HttpStatus.BAD_REQUEST, message: 'Invalid data provided', code: 'VALIDATION_ERROR' };
    }

    // Prisma initialization error — DB unreachable
    if (exception instanceof Prisma.PrismaClientInitializationError) {
      return { status: HttpStatus.SERVICE_UNAVAILABLE, message: 'Database unavailable', code: 'DB_UNAVAILABLE' };
    }

    // Prisma Rust panic — engine crash
    if (exception instanceof Prisma.PrismaClientRustPanicError) {
      return { status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Internal server error', code: 'DB_ENGINE_ERROR' };
    }

    // Unknown errors — opaque 500
    return { status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Internal server error' };
  }

  private handlePrismaError(error: Prisma.PrismaClientKnownRequestError): {
    status: number;
    message: string;
    code: string;
  } {
    switch (error.code) {
      case 'P2002': {
        const target = (error.meta?.target as string[]) ?? [];
        const field = target.length ? target.join(', ') : 'value';
        return {
          status: HttpStatus.CONFLICT,
          message: `A record with this ${field} already exists`,
          code: 'UNIQUE_VIOLATION',
        };
      }
      case 'P2025':
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'The requested record was not found',
          code: 'RECORD_NOT_FOUND',
        };
      case 'P2003':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Invalid reference — the referenced record does not exist',
          code: 'FOREIGN_KEY_VIOLATION',
        };
      case 'P2014':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'The change would violate a required relation',
          code: 'REQUIRED_RELATION_VIOLATION',
        };
      case 'P2021':
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error',
          code: 'TABLE_NOT_FOUND',
        };
      case 'P2022':
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error',
          code: 'COLUMN_NOT_FOUND',
        };
      default:
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error',
          code: `PRISMA_${error.code}`,
        };
    }
  }
}
