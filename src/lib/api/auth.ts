import { apiPost, apiGet, setAccessToken } from './fetch';

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
  return apiPost<UserResponse>('/auth/register', input, { skipAuth: true });
}

export async function login(input: LoginInput): Promise<AuthResponse> {
  const response = await apiPost<AuthResponse>('/auth/login', input, { skipAuth: true });
  setAccessToken(response.accessToken);
  return response;
}

export async function verifyEmail(input: VerifyEmailInput): Promise<UserResponse> {
  return apiPost<UserResponse>('/auth/email/verify', input, { skipAuth: true });
}

export async function resendVerification(input: ResendVerificationInput): Promise<{ email: string }> {
  return apiPost<{ email: string }>('/auth/email/resend', input, { skipAuth: true });
}

export async function getCurrentUser(): Promise<UserResponse> {
  try {
    return await apiGet<UserResponse>('/users/me');
  } catch {
    return await apiGet<UserResponse>('/auth/me');
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await apiPost<void>('/auth/logout');
  } finally {
    setAccessToken(null);
  }
}

export async function logoutAll(): Promise<void> {
  try {
    await apiPost<void>('/auth/logout-all');
  } finally {
    setAccessToken(null);
  }
}
