import { apiFetch, setToken } from './client';
import type { ApiError, BearerResponse, UserCreate, UserRead } from '@/lib/types';

export async function registerUser(
  username: string,
  password: string,
): Promise<UserRead> {
  const body: UserCreate = { username, password };
  return apiFetch<UserRead>('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export async function loginUser(
  username: string,
  password: string,
): Promise<UserRead> {
  const formData = new URLSearchParams();
  formData.set('username', username);
  formData.set('password', password);

  const bearer = await apiFetch<BearerResponse>('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString(),
  });

  setToken(bearer.access_token);
  return getCurrentUser();
}

export async function getCurrentUser(): Promise<UserRead> {
  return apiFetch<UserRead>('/auth/me', { method: 'GET' });
}

export function isApiError(err: unknown): err is ApiError {
  return (
    typeof err === 'object' &&
    err !== null &&
    'status' in err &&
    'message' in err
  );
}
