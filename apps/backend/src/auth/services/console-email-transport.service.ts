import { Injectable, Logger } from '@nestjs/common';
import {
  type EmailTransport,
  type PasswordResetEmailOptions,
  type VerificationEmailOptions,
} from './email-transport.abstraction';

@Injectable()
export class ConsoleEmailTransportService implements EmailTransport {
  private readonly logger = new Logger(ConsoleEmailTransportService.name);

  async sendVerificationEmail(to: string, options: VerificationEmailOptions): Promise<void> {
    const greeting = options.userDisplayName ? `Hi ${options.userDisplayName},` : 'Hi,';
    this.logger.log(
      [
        '--- Verification email (console transport) ---',
        `To: ${to}`,
        greeting,
        'Use the link below to verify your email address:',
        options.link,
        '---',
      ].join('\n'),
    );
  }

  async sendPasswordResetEmail(to: string, options: PasswordResetEmailOptions): Promise<void> {
    const greeting = options.userDisplayName ? `Hi ${options.userDisplayName},` : 'Hi,';
    // The raw token is deliberately not logged separately; only the link is,
    // matching the verification email (see c995a15).
    this.logger.log(
      [
        '--- Password reset email (console transport) ---',
        `To: ${to}`,
        greeting,
        `Use the link below to choose a new password. It expires in ${options.expiresInMinutes} minutes:`,
        options.link,
        'If you did not request this, you can ignore this email.',
        '---',
      ].join('\n'),
    );
  }
}
