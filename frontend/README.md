# PaperWhisper — Document Intelligence

PaperWhisper is an AI document research and question-answering web application. Upload documents to your knowledge base, then have grounded AI conversations about their content.

## Features

- **Authentication** — Register and sign in with username/password (JWT-based)
- **Document Upload** — Drag-and-drop document upload with ingestion feedback
- **Conversations** — Create, list, open, and delete AI conversations
- **RAG Chat** — Ask questions about your documents and receive grounded answers
- **Markdown Rendering** — Rich answers with code blocks, tables, lists, and more
- **Responsive Design** — Works from mobile to desktop with adaptive sidebar

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router
- React Markdown + remark-gfm
- Lucide React icons

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Development

The dev server uses a Vite proxy (`/api` → backend) to avoid CORS issues during development. All API calls are routed through `/api/*` which Vite proxies to the configured backend URL in `vite.config.ts`.

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## API Configuration

The frontend communicates with a FastAPI backend. The API base URL is set in:

```
src/lib/api/client.ts → API_BASE_URL
```

### Backend Endpoints Used

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login (form-encoded) |
| GET | `/auth/me` | Get current authenticated user |
| POST | `/documents/upload` | Upload a document (multipart) |
| POST | `/chats` | Create a new conversation |
| GET | `/chats` | List all conversations |
| GET | `/chats/{thread_id}` | Get conversation metadata |
| DELETE | `/chats/{thread_id}` | Delete a conversation |
| POST | `/chat/{thread_id}` | Send a message and get RAG response |

## Docker

Build and run the frontend container:

```bash
docker build -t paperwhisper-frontend .
docker run -p 8080:80 paperwhisper-frontend
```

## CORS

The backend must allow the frontend's origin through CORS. Configure the backend's CORS settings to include the deployed frontend URL.

## Architecture

```
Browser
  ↓
PaperWhisper Frontend (React/Vite)
  ↓
FastAPI API
  ↓
RAG / Qdrant / Database / LLM
```

The frontend only communicates with the FastAPI API. It never directly accesses Qdrant, SQLite, LangGraph, or the LLM provider.

## Project Structure

```
src/
  components/
    chat/         — Chat interface components
    documents/    — Upload and document components
    layout/       — App shell, sidebar, user menu
    ui/           — Reusable UI primitives
  lib/
    api/          — API client and service modules
    types.ts      — TypeScript types matching backend schemas
    auth-context.tsx — Authentication state provider
    message-cache.ts — Local message caching per conversation
    upload-history.ts — Local upload history
  pages/          — Route-level page components
```

## Notes

- Message history is cached client-side per conversation (localStorage). The backend does not currently expose a message history endpoint.
- Upload history is stored client-side for the current session.
- Logout is handled client-side (no backend logout endpoint).
