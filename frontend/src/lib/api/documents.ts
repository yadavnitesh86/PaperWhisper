import { apiFetch, getToken } from './client';
import { API_BASE_URL } from './client';
import type { UploadResponse } from '@/lib/types';

export async function uploadDocument(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const headers = new Headers();
  const token = getToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}/documents/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    throw {
      status: response.status,
      message: response.status === 422 ? 'Please choose a valid file.' : 'Upload failed. Try again.',
    };
  }

  return response.json() as Promise<UploadResponse>;
}
