import { IsEmail, MaxLength } from 'class-validator';

/**
 * Validates the forgot-password request body.
 *
 * The endpoint previously took a bare `@Body('email') email: string`, which
 * bypasses the global ValidationPipe entirely (there is no metatype to
 * validate against). Any unbounded string was accepted and written straight
 * into Redis.
 */
export class ForgotPasswordDto {
  @IsEmail({}, { message: 'A valid email address is required' })
  @MaxLength(254) // RFC 5321 maximum
  email!: string;
}
