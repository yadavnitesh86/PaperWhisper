import type { Message } from '@/lib/types';

const CACHE_PREFIX = 'pw_msgcache_';

function cacheKey(threadId: string): string {
  return `${CACHE_PREFIX}${threadId}`;
}

export function getCachedMessages(threadId: string): Message[] {
  try {
    const raw = localStorage.getItem(cacheKey(threadId));
    if (!raw) return [];
    return JSON.parse(raw) as Message[];
  } catch {
    return [];
  }
}

export function setCachedMessages(threadId: string, messages: Message[]): void {
  try {
    localStorage.setItem(cacheKey(threadId), JSON.stringify(messages));
  } catch {
    // storage full or unavailable
  }
}

export function appendCachedMessage(threadId: string, message: Message): void {
  const messages = getCachedMessages(threadId);
  messages.push(message);
  setCachedMessages(threadId, messages);
}

export function clearCachedMessages(threadId: string): void {
  localStorage.removeItem(cacheKey(threadId));
}

export function clearAllCachedMessages(): void {
  const keys = Object.keys(localStorage);
  for (const key of keys) {
    if (key.startsWith(CACHE_PREFIX)) {
      localStorage.removeItem(key);
    }
  }
}
