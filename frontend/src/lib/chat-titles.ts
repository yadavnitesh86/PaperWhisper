const TITLES_KEY = 'pw_chat_titles';

function readAll(): Record<string, string> {
  try {
    const raw = localStorage.getItem(TITLES_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

function writeAll(titles: Record<string, string>): void {
  try {
    localStorage.setItem(TITLES_KEY, JSON.stringify(titles));
  } catch {
    // storage full or unavailable
  }
}

export function getChatTitle(threadId: string): string | null {
  const all = readAll();
  return all[threadId] ?? null;
}

export function setChatTitle(threadId: string, title: string): void {
  const all = readAll();
  all[threadId] = title;
  writeAll(all);
}

export function clearChatTitle(threadId: string): void {
  const all = readAll();
  delete all[threadId];
  writeAll(all);
}

export function clearAllChatTitles(): void {
  localStorage.removeItem(TITLES_KEY);
}
