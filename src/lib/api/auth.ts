import { apiPost, apiGet, setAccessToken } from "./fetch";

export interface UserResponse {
  id: string;
  email: string;
  name: string | null;
  role: string;
  status: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: UserResponse;
  accessToken: string;
  expiresIn: number;
  refreshToken?: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface VerifyEmailInput {
  token: string;
}

export interface ResendVerificationInput {
  email: string;
}

export async function register(input: RegisterInput): Promise<UserResponse> {
  return apiPost<UserResponse>("/auth/register", input, { skipAuth: true });
}

export async function login(input: LoginInput): Promise<AuthResponse> {
  const response = await apiPost<AuthResponse>("/auth/login", input, { skipAuth: true });
  setAccessToken(response.accessToken);
  return response;
}

export async function verifyEmail(input: VerifyEmailInput): Promise<UserResponse> {
  return apiPost<UserResponse>("/auth/email/verify", input, { skipAuth: true });
}

export async function resendVerification(
  input: ResendVerificationInput,
): Promise<{ email: string }> {
  return apiPost<{ email: string }>("/auth/email/resend", input, { skipAuth: true });
}

export async function getCurrentUser(): Promise<UserResponse> {
  return await apiGet<UserResponse>("/auth/me");
}

export async function logoutUser(): Promise<void> {
  try {
    // skipAuth: the endpoint authenticates via the httpOnly refresh cookie,
    // not the bearer token. Without this, logging out with an expired access
    // token would trigger a refresh (rotating the refresh token) just to end
    // the session, and could surface a spurious error on a successful logout.
    await apiPost<void>("/auth/logout", undefined, { skipAuth: true });
  } finally {
    setAccessToken(null);
  }
}

export async function logoutAll(): Promise<void> {
  try {
    // Unlike /auth/logout, this endpoint is behind JwtAuthGuard and needs the
    // bearer token, so it must NOT skip auth.
    await apiPost<void>("/auth/logout-all");
  } finally {
    setAccessToken(null);
  }
}

export async function resetPassword(input: {
  token: string;
  password: string;
}): Promise<{ message: string }> {
  return apiPost<{ message: string }>("/auth/reset-password", input, { skipAuth: true });
}

export async function forgotPassword(input: { email: string }): Promise<{ message: string }> {
  return apiPost<{ message: string }>("/auth/forgot-password", input, { skipAuth: true });
}
