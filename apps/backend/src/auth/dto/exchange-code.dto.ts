import { IsUUID } from 'class-validator';

/**
 * The code is used to build a Redis key, so it must be constrained. Extracting
 * it with @Body('code') bypassed the global ValidationPipe entirely, letting an
 * attacker submit an arbitrary unbounded string.
 *
 * OAuthStateService issues randomUUID() values, so UUID v4 is the exact shape.
 */
export class ExchangeCodeDto {
  @IsUUID('4')
  code!: string;
}
