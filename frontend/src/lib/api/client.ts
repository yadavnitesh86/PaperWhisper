import type { ApiError } from '@/lib/types';

const API_BASE_URL = '/api';

const TOKEN_KEY = 'paperwhisper_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function extractApiError(
  err: unknown,
  fallback: string,
): ApiError {
  if (err && typeof err === 'object' && 'status' in err && 'message' in err) {
    return err as ApiError;
  }
  return { status: 0, message: fallback };
}

function friendlyMessage(status: number): string {
  switch (status) {
    case 400:
      return 'The request could not be processed. Please check and try again.';
    case 401:
      return 'Your session has expired. Please sign in again.';
    case 403:
      return "You don't have access to this resource.";
    case 404:
      return 'The resource was not found.';
    case 422:
      return 'Please check the information you entered.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
      return "PaperWhisper couldn't complete that request. Try again.";
    case 502:
    case 503:
    case 504:
      return 'The server is temporarily unavailable. Try again shortly.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const headers = new Headers(options.headers);
  const token = getToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch {
    const error: ApiError = {
      status: 0,
      message:
        'Cannot reach the PaperWhisper server. The server may be temporarily unavailable or there may be a network issue.',
    };
    throw error;
  }

  if (response.status === 401) {
    clearToken();
  }

  if (!response.ok) {
    let detail: unknown = undefined;
    try {
      detail = await response.json();
    } catch {
      // body not JSON
    }
    const error: ApiError = {
      status: response.status,
      message: friendlyMessage(response.status),
      detail,
    };
    throw error;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export { API_BASE_URL };
