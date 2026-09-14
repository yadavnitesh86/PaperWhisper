import type { UploadResponse } from '@/lib/types';

export interface UploadHistoryItem {
  id: string;
  filename: string;
  ingested_chunks: number;
  failed_files: string[];
  uploaded_at: string;
}

const HISTORY_PREFIX = 'pw_upload_history_';

function historyKey(userId: string): string {
  return `${HISTORY_PREFIX}${userId}`;
}

export function getUploadHistory(userId: string): UploadHistoryItem[] {
  try {
    const raw = localStorage.getItem(historyKey(userId));
    if (!raw) return [];
    return JSON.parse(raw) as UploadHistoryItem[];
  } catch {
    return [];
  }
}

export function addUploadHistory(
  userId: string,
  response: UploadResponse,
): UploadHistoryItem {
  const item: UploadHistoryItem = {
    id: crypto.randomUUID(),
    filename: response.filename,
    ingested_chunks: response.ingested_chunks,
    failed_files: response.failed_files,
    uploaded_at: new Date().toISOString(),
  };
  const history = getUploadHistory(userId);
  history.unshift(item);
  localStorage.setItem(historyKey(userId), JSON.stringify(history));
  return item;
}

export function clearUploadHistory(userId: string): void {
  localStorage.removeItem(historyKey(userId));
}
