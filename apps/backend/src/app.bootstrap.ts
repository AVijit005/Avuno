import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { INestApplication, NestApplicationOptions } from '@nestjs/common';
import helmet from 'helmet';
// import compression from 'compression'; // NOTE: Compression disabled in app layer due to Bun test failures (require("debug") is not a function). Move compression to reverse proxy (Nginx/Cloudflare/Vercel) instead.
import cookieParser from 'cookie-parser';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import { randomUUID } from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

export async function createApp(options?: NestApplicationOptions): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    bodyParser: true,
  });

  const config = app.get(ConfigService);
  const logger = app.get(Logger);
  app.useLogger(logger);

  app.setGlobalPrefix(config.get<string>('apiPrefix') ?? 'api');

  // Trust proxy for rate limiting behind load balancers
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https:"],
      },
    },
  }));
  // app.use(compression()); // Handled at CDN/Reverse Proxy level
  app.use(cookieParser());
  app.use((req: Request, res: Response, next: NextFunction) => {
    const requestId = (req.get('x-request-id') ?? randomUUID()) as string;
    req.id = requestId;
    res.setHeader('x-request-id', requestId);
    next();
  });
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const raw = process.env.CORS_ORIGIN || '';
      const allowedOrigins = raw
        .replace(/"/g, '')
        .replace(/'/g, '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      if (
        allowedOrigins.length === 0 ||
        allowedOrigins.includes('*') ||
        allowedOrigins.includes(origin) ||
        origin.includes('avuno.xyz') ||
        origin.includes('pages.dev') ||
        origin.includes('localhost')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id', 'ngrok-skip-browser-warning', 'x-correlation-id'],
  });

  app.useGlobalInterceptors(new LoggerErrorInterceptor());

  const swaggerEnabled = config.get<boolean | undefined>('swagger.enabled') === true && config.get<string>('nodeEnv') !== 'production';
  const swaggerPath = config.get<string>('swagger.path') ?? 'docs';

  if (swaggerEnabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle(config.get<string>('swagger.title') ?? 'Chronicle API')
      .setDescription(config.get<string>('swagger.description') ?? '')
      .setVersion(config.get<string>('swagger.version') ?? '0.0.1')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(swaggerPath, app, document);
  }

  app.enableShutdownHooks();

  return app;
}
