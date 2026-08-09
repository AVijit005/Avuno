import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { ConfigService } from '@nestjs/config';

/**
 * Ported from Jest to bun:test. The file previously used jest.mock and
 * jest.fn, neither of which exists under the configured runner (`bun test`),
 * so it contributed 28 TypeScript errors and could never have executed.
 */

const setupSpy = mock(() => undefined);
const createDocumentSpy = mock(() => ({}));

// Swapped in before app.bootstrap is imported, so the module under test picks
// up these doubles.
// Spread the real module: controllers across the app import decorators such
// as ApiTags from here, so a narrow mock breaks their imports.
// require() rather than top-level await: tsconfig sets module=commonjs.
/* eslint-disable @typescript-eslint/no-require-imports */
const actualSwagger = require('@nestjs/swagger');

mock.module('@nestjs/swagger', () => ({
  ...actualSwagger,
  SwaggerModule: {
    createDocument: createDocumentSpy,
    setup: setupSpy,
  },
}));

// Same reasoning as the swagger mock: Reflector, BaseExceptionFilter and
// APP_* tokens are imported from here across the app.
const actualCore = require('@nestjs/core');

mock.module('@nestjs/core', () => ({
  ...actualCore,
  NestFactory: {
    create: () =>
      Promise.resolve({
        get: (token: unknown) => {
          if (token === ConfigService) {
            return {
              get: (key: string) => {
                if (key === 'swagger.enabled') return true;
                if (key === 'nodeEnv') return process.env.NODE_ENV_TEST;
                if (key === 'apiPrefix') return 'api';
                return undefined;
              },
            };
          }
          return { info: () => undefined, error: () => undefined, warn: () => undefined };
        },
        useLogger: () => undefined,
        setGlobalPrefix: () => undefined,
        getHttpAdapter: () => ({ getInstance: () => ({ set: () => undefined }) }),
        use: () => undefined,
        enableCors: () => undefined,
        useGlobalInterceptors: () => undefined,
        enableShutdownHooks: () => undefined,
      }),
  },
}));

const { createApp } = require('./app.bootstrap') as typeof import('./app.bootstrap');
const { SwaggerModule } = require('@nestjs/swagger') as typeof import('@nestjs/swagger');
/* eslint-enable @typescript-eslint/no-require-imports */

describe('app.bootstrap', () => {
  beforeEach(() => {
    setupSpy.mockClear();
    createDocumentSpy.mockClear();
  });

  it('disables Swagger in production even when swagger.enabled is true', async () => {
    process.env.NODE_ENV_TEST = 'production';
    await createApp();
    expect(SwaggerModule.setup).not.toHaveBeenCalled();
  });

  it('enables Swagger in development when swagger.enabled is true', async () => {
    process.env.NODE_ENV_TEST = 'development';
    await createApp();
    expect(SwaggerModule.setup).toHaveBeenCalled();
  });
});
