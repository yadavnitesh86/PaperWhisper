import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Message } from '@/lib/types';
import { sendMessage } from '@/lib/api/chats';
import {
  appendCachedMessage,
  getCachedMessages,
  setCachedMessages,
} from '@/lib/message-cache';
import { ChatMessage } from './ChatMessage';
import { ChatComposer } from './ChatComposer';
import { ThinkingIndicator } from './ThinkingIndicator';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { MessageSquare, FileText } from 'lucide-react';

interface ChatViewProps {
  threadId: string;
  title: string;
  onRefreshSidebar: () => void;
}

function truncateTitle(text: string, maxLen = 50): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLen) return trimmed;
  return trimmed.slice(0, maxLen).trimEnd() + '...';
}

export function ChatView({ threadId, title, onRefreshSidebar }: ChatViewProps) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [thinking, setThinking] = useState(false);
  const [errorRetry, setErrorRetry] = useState<string | null>(null);
  const [displayTitle, setDisplayTitle] = useState(title);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const cached = getCachedMessages(threadId);
    setMessages(cached);
    setDisplayTitle(title);
  }, [threadId, title]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, thinking]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const handleSend = useCallback(
    async (content: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      appendCachedMessage(threadId, userMessage);

      const isFirstMessage = messages.length === 0;
      if (isFirstMessage) {
        const newTitle = truncateTitle(content);
        setDisplayTitle(newTitle);
      }

      setThinking(true);
      setErrorRetry(null);

      try {
        const response = await sendMessage(threadId, content);
        if (controller.signal.aborted) return;

        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: response.answer,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        appendCachedMessage(threadId, assistantMessage);
        onRefreshSidebar();
      } catch (err) {
        if (controller.signal.aborted) return;

        const apiErr = err as { status?: number; message?: string; isTimeout?: boolean };
        let errorMsg: string;

        if (apiErr.isTimeout) {
          errorMsg = 'PaperWhisper is taking longer than expected. Please try again.';
        } else if (apiErr.status === 0) {
          errorMsg =
            'Unable to reach PaperWhisper right now. Please check your connection and try again.';
        } else if (apiErr.status && apiErr.status >= 500) {
          errorMsg = apiErr.message || 'PaperWhisper ran into a temporary server problem. Please try again shortly.';
        } else if (apiErr.status && apiErr.status >= 400) {
          errorMsg = apiErr.message || 'Failed to get a response. Try again.';
        } else {
          errorMsg = apiErr.message || 'Failed to get a response. Try again.';
        }

        const errorMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `__ERROR__${errorMsg}`,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        appendCachedMessage(threadId, errorMessage);
        setErrorRetry(content);
      } finally {
        if (!controller.signal.aborted) {
          setThinking(false);
        }
      }
    },
    [threadId, messages.length, onRefreshSidebar],
  );

  const handleRetry = useCallback(() => {
    if (!errorRetry) return;
    const retryContent = errorRetry;
    setMessages((prev) => {
      const filtered = prev.filter((m) => !m.content.startsWith('__ERROR__'));
      setCachedMessages(threadId, filtered);
      return filtered;
    });
    setErrorRetry(null);
    handleSend(retryContent);
  }, [errorRetry, threadId, handleSend]);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-ink-200 bg-white px-4 py-2.5 shadow-depth-1">
        <div className="mx-auto flex max-w-3xl items-center gap-2">
          <button
            onClick={() => navigate('/app')}
            className="text-sm text-ink-400 transition-colors hover:text-ink-700"
          >
            PaperWhisper
          </button>
          <span className="text-ink-300">/</span>
          <span className="truncate text-sm font-medium text-ink-800">
            {displayTitle}
          </span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl py-4">
          {messages.length === 0 && !thinking ? (
            <div className="pt-12">
              <EmptyState
                icon={<MessageSquare className="h-7 w-7" />}
                title="Start the conversation"
                description="Ask PaperWhisper anything about your uploaded documents. Your first question becomes the conversation title."
              />
              <div className="mt-6 flex justify-center">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/app/documents')}
                >
                  <FileText className="h-4 w-4" />
                  Upload a document first
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {messages.map((msg, idx) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  onRetry={
                    msg.content.startsWith('__ERROR__') &&
                    idx === messages.length - 1
                      ? handleRetry
                      : undefined
                  }
                />
              ))}
              {thinking && <ThinkingIndicator />}
            </div>
          )}
        </div>
      </div>

      <ChatComposer onSend={handleSend} disabled={thinking} />
    </div>
  );
}