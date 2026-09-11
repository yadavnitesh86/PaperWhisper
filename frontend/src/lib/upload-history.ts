import type { UploadResponse } from '@/lib/types';

export interface UploadHistoryItem {
  id: string;
  filename: string;
  ingested_chunks: number;
  failed_files: string[];
  uploaded_at: string;
}

const HISTORY_KEY = 'pw_upload_history';

export function getUploadHistory(): UploadHistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as UploadHistoryItem[];
  } catch {
    return [];
  }
}

export function addUploadHistory(
  response: UploadResponse,
): UploadHistoryItem {
  const item: UploadHistoryItem = {
    id: crypto.randomUUID(),
    filename: response.filename,
    ingested_chunks: response.ingested_chunks,
    failed_files: response.failed_files,
    uploaded_at: new Date().toISOString(),
  };
  const history = getUploadHistory();
  history.unshift(item);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  return item;
}

export function clearUploadHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}
