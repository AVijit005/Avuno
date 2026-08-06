import { Injectable, Logger } from '@nestjs/common';
import { type EmailTransport, type VerificationEmailOptions } from './email-transport.abstraction';

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
}
