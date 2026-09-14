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

export function parseAuthError(err: unknown, context: 'login' | 'register'): string {
  const apiErr = err as ApiError;

  if (apiErr.status === 0) {
    return apiErr.message;
  }

  if (apiErr.status === 400) {
    const detail = apiErr.detail as { detail?: unknown } | undefined;
    const detailValue = detail?.detail;

    if (context === 'login') {
      if (detailValue === 'LOGIN_BAD_CREDENTIALS') {
        return 'Invalid username or password. Please check your credentials and try again.';
      }
      return 'Authentication failed. Please check your credentials.';
    }

    if (context === 'register') {
      if (detailValue === 'REGISTER_USER_ALREADY_EXISTS') {
        return 'This username is already taken. Please choose a different one.';
      }
      if (detailValue && typeof detailValue === 'object' && 'reason' in (detailValue as Record<string, unknown>)) {
        return (detailValue as { reason: string }).reason;
      }
      return 'Registration failed. Please check your information.';
    }
  }

  if (apiErr.status === 422) {
    const detail = apiErr.detail as { detail?: Array<{ msg: string; loc: (string | number)[] }> } | undefined;
    if (detail?.detail && Array.isArray(detail.detail) && detail.detail.length > 0) {
      const messages = detail.detail.map((d) => {
        const field = d.loc?.filter((l) => l !== 'body').join('.');
        return field ? `${field}: ${d.msg}` : d.msg;
      });
      return messages.join('; ');
    }
    return 'Please check the information you entered.';
  }

  return apiErr.message;
}
