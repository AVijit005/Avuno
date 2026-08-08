import { UserResponseDto } from './user-response.dto';

export class AuthResponseDto {
  user: UserResponseDto;
  accessToken: string;
  expiresIn: number;
}

/**
 * Internal-only variant returned by finishOAuthLogin.
 *
 * The refresh token is carried here so the OAuth code exchange can set the
 * httpOnly cookie later in the flow. It must NEVER be serialised to a client:
 * that would defeat httpOnly entirely. Previously this was smuggled through
 * an `as any` cast on AuthResponseDto, which hid the leak risk from the
 * type system.
 */
export interface InternalAuthResult extends AuthResponseDto {
  refreshToken: string;
}
