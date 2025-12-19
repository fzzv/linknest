import { apiClient } from '@/lib/api-client';
import type { LoginFormValues, RegisterFormValues, ResetPasswordFormValues } from '@/schemas/auth';

export interface User {
  id: number;
  email: string;
  nickname: string | null;
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: User;
}

export interface RegisterResponse {
  user: User;
}

export interface MessageResponse {
  message: string;
}

export const login = (payload: LoginFormValues) =>
  apiClient<AuthResponse>('/users/login', {
    method: 'POST',
    body: payload,
  });

export const registerAccount = (payload: RegisterFormValues) => {
  const { confirmPassword, ...rest } = payload;
  return apiClient<RegisterResponse>('/users/register', {
    method: 'POST',
    body: rest,
  });
};

export const sendVerificationCode = (email: string) =>
  apiClient<MessageResponse>('/users/send-code', {
    method: 'POST',
    body: { email },
  });

export const sendResetPasswordCode = (email: string) =>
  apiClient<MessageResponse>('/users/reset-password/code', {
    method: 'POST',
    body: { email },
  });

export const resetPassword = (payload: ResetPasswordFormValues) =>
  apiClient<MessageResponse>('/users/reset-password', {
    method: 'PATCH',
    body: payload,
  });
