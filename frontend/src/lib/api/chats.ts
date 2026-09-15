import { apiFetch, CHAT_TIMEOUT_MS } from './client';
import type {
  ChatResponse,
  ConversationResponse,
  NewChatResponse,
} from '@/lib/types';

export async function createChat(): Promise<NewChatResponse> {
  return apiFetch<NewChatResponse>('/chats', { method: 'POST' });
}

export async function listChats(): Promise<ConversationResponse[]> {
  return apiFetch<ConversationResponse[]>('/chats', { method: 'GET' });
}

export async function getChat(threadId: string): Promise<ConversationResponse> {
  return apiFetch<ConversationResponse>(`/chats/${threadId}`, {
    method: 'GET',
  });
}

export async function deleteChat(threadId: string): Promise<void> {
  return apiFetch<void>(`/chats/${threadId}`, { method: 'DELETE' });
}

export async function sendMessage(
  threadId: string,
  message: string,
): Promise<ChatResponse> {
  return apiFetch<ChatResponse>(`/chat/${threadId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
    timeoutMs: CHAT_TIMEOUT_MS,
  });
}