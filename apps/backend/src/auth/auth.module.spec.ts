import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';

/**
 * OAuthAccountRepository now requires a real 32-byte key at construction time
 * (the hardcoded fallback was removed), so the module cannot be instantiated
 * without one.
 */
const TEST_CONFIG: Record<string, string> = {
  'oauth.encryptionKey': '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
  'google.clientId': 'test-client-id',
  'google.clientSecret': 'test-client-secret',
  'google.callbackUrl': 'http://localhost:3000/api/auth/google/callback',
  'redis.host': '127.0.0.1',
  'redis.port': '6379',
  'redis.db': '0',
};
import { AuthModule } from './auth.module';
import { EMAIL_TRANSPORT, ResendEmailTransportService, ConsoleEmailTransportService } from './services';
import { PrismaModule } from '../prisma/prisma.module';
import { SharedModule } from '../shared';

jest.mock('../prisma/prisma.module', () => ({
  PrismaModule: class {},
}));

describe('AuthModule', () => {
  it('should use ConsoleEmailTransportService when nodeEnv is development', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(ConfigService)
      .useValue({ get: (key) => (key === 'nodeEnv' ? 'development' : (TEST_CONFIG[key] ?? null)) })
      .compile();

    const transport = module.get(EMAIL_TRANSPORT);
    expect(transport).toBeInstanceOf(ConsoleEmailTransportService);
  });

  it('should use ResendEmailTransportService when nodeEnv is production', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(ConfigService)
      .useValue({ get: (key) => (key === 'nodeEnv' ? 'production' : (TEST_CONFIG[key] ?? null)) })
      .compile();

    const transport = module.get(EMAIL_TRANSPORT);
    expect(transport).toBeInstanceOf(ResendEmailTransportService);
  });
});
