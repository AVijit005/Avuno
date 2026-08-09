export const EMAIL_TRANSPORT = Symbol('EMAIL_TRANSPORT');

export interface VerificationEmailOptions {
  token: string;
  link: string;
  userDisplayName?: string;
}

export interface PasswordResetEmailOptions {
  link: string;
  userDisplayName?: string;
  /** Minutes until the link stops working, so the copy can say so. */
  expiresInMinutes: number;
}

export interface EmailTransport {
  sendVerificationEmail(to: string, options: VerificationEmailOptions): Promise<void>;
  sendPasswordResetEmail(to: string, options: PasswordResetEmailOptions): Promise<void>;
}
