import { describe, it, expect, beforeEach, spyOn } from 'bun:test';
import { ConsoleEmailTransportService } from './console-email-transport.service';
import { Logger } from '@nestjs/common';

describe('ConsoleEmailTransportService', () => {
  let service: ConsoleEmailTransportService;
  let loggedMessages: string[];

  beforeEach(() => {
    service = new ConsoleEmailTransportService();
    loggedMessages = [];
    spyOn(Logger.prototype, 'log').mockImplementation((message: unknown) => {
      loggedMessages.push(String(message));
    });
  });

  it('sends a verification email by logging the link and token to console', async () => {
    await service.sendVerificationEmail('alice@example.com', {
      token: 'raw-token-abc',
      link: 'http://localhost:3000/api/auth/email/verify?token=raw-token-abc',
    });

    expect(loggedMessages).toHaveLength(1);
    const message = loggedMessages[0];
    expect(message).toContain('Verification email');
    expect(message).toContain('To: alice@example.com');
    expect(message).toContain('http://localhost:3000/api/auth/email/verify?token=raw-token-abc');
    // The bare token must NOT be logged separately. c995a15 removed it
    // deliberately: log aggregators retain these lines, and a verification
    // token is an account-takeover primitive for its full 24h lifetime.
    expect(message).not.toContain('Raw token:');
  });

  it('includes displayName greeting when provided', async () => {
    await service.sendVerificationEmail('alice@example.com', {
      token: 'raw-token-abc',
      link: 'http://localhost:3000/api/auth/email/verify?token=raw-token-abc',
      userDisplayName: 'Alice',
    });

    expect(loggedMessages).toHaveLength(1);
    const message = loggedMessages[0];
    expect(message).toContain('Hi Alice');
  });

  it('falls back to a generic greeting when displayName is missing', async () => {
    await service.sendVerificationEmail('alice@example.com', {
      token: 'raw-token-abc',
      link: 'http://localhost:3000/api/auth/email/verify?token=raw-token-abc',
    });

    expect(loggedMessages).toHaveLength(1);
    const message = loggedMessages[0];
    expect(message).toContain('Hi,');
  });
});
