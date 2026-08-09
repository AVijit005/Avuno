import { IsString, MaxLength, MinLength } from 'class-validator';

/**
 * Completes a password reset.
 *
 * The password constraints mirror RegisterDto so a reset cannot be used to set
 * a weaker password than registration allows.
 */
export class ResetPasswordDto {
  @IsString()
  @MinLength(20, { message: 'Invalid reset token' })
  @MaxLength(256, { message: 'Invalid reset token' })
  token!: string;

  @IsString()
  @MinLength(12)
  @MaxLength(128)
  password!: string;
}
