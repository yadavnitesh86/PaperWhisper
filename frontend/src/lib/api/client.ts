import type { ApiError } from '@/lib/types';

const API_BASE_URL = '/api';
const TOKEN_KEY = 'paperwhisper_token';

const DEFAULT_TIMEOUT_MS = 180_000;
const CHAT_TIMEOUT_MS = 180_000;

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

function isAbortError(err: unknown): boolean {
  return (
    err instanceof DOMException &&
    (err.name === 'AbortError' || err.name === 'TimeoutError')
  );
}

function looksLikeModelProviderError(detail: unknown): boolean {
  if (!detail) return false;
  const text = JSON.stringify(detail).toLowerCase();
  return (
    text.includes('openaipermissiondeniederror') ||
    text.includes('openai') &&
      (text.includes('permission') || text.includes('denied')) ||
    text.includes('model') &&
      (text.includes('unavailable') || text.includes('permission')) ||
    text.includes('api_key') ||
    text.includes('provider') &&
      (text.includes('unavailable') || text.includes('error'))
  );
}

function friendlyMessage(status: number, detail?: unknown): string {
  if (status >= 500 && status <= 599) {
    if (looksLikeModelProviderError(detail)) {
      return "PaperWhisper's AI model is temporarily unavailable. Please try again later.";
    }
    return 'PaperWhisper ran into a temporary server problem. Please try again shortly.';
  }
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
    default:
      return 'Something went wrong. Please try again.';
  }
}

export interface ApiFetchOptions extends RequestInit {
  timeoutMs?: number;
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const headers = new Headers(options.headers);
  const token = getToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
      signal: options.signal ?? controller.signal,
    });
  } catch (err) {
    if (isAbortError(err)) {
      throw {
        status: 0,
        message: 'PaperWhisper is taking longer than expected. Please try again.',
        isTimeout: true,
      } as ApiError & { isTimeout: boolean };
    }
    throw {
      status: 0,
      message:
        'Unable to reach PaperWhisper right now. Please check your connection and try again.',
    } as ApiError;
  } finally {
    clearTimeout(timeoutId);
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
      message: friendlyMessage(response.status, detail),
      detail,
    };
    throw error;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export { API_BASE_URL, CHAT_TIMEOUT_MS };