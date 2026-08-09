import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { EmailTransport, VerificationEmailOptions } from './email-transport.abstraction';

@Injectable()
export class ResendEmailTransportService implements EmailTransport {
  private readonly logger = new Logger(ResendEmailTransportService.name);
  private resend: Resend;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('EMAIL_API_KEY') || 'dummy-key-for-tests';
    const isProduction = (this.configService.get<string>('NODE_ENV') || process.env.NODE_ENV) === 'production';
    if (isProduction && apiKey === 'dummy-key-for-tests') {
      throw new Error('EMAIL_API_KEY must be set in production');
    }
    this.resend = new Resend(apiKey);
  }

  async sendVerificationEmail(to: string, options: VerificationEmailOptions): Promise<void> {
    const { link, userDisplayName } = options;
    const fromEmail = this.configService.get<string>('EMAIL_FROM') || 'noreply@chronicle.com';
    const safeName = String(userDisplayName || 'there').replace(/[<>&"']/g, '');

    try {
      await this.resend.emails.send({
        from: fromEmail,
        to,
        subject: 'Verify your Chronicle Account',
        html: `<p>Hi ${safeName},</p><p>Please verify your account by clicking the link below:</p><p><a href="${link}">${link}</a></p>`,
      });
      this.logger.log(`Verification email sent to ${to} via Resend`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`, error.stack);
      throw error;
    }
  }
}
