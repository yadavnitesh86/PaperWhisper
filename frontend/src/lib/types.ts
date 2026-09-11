export interface UserRead {
  id: string;
  email: string;
  is_active?: boolean;
  is_superuser?: boolean;
  is_verified?: boolean;
  username: string;
}

export interface BearerResponse {
  access_token: string;
  token_type: string;
}

export interface UserCreate {
  username: string;
  password: string;
}

export interface UploadResponse {
  filename: string;
  ingested_chunks: number;
  failed_files: string[];
}

export interface NewChatResponse {
  thread_id: string;
  title: string;
}

export interface ConversationResponse {
  thread_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  thread_id: string;
  answer: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface ApiError {
  status: number;
  message: string;
  detail?: unknown;
}
