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
import { MessageSquare } from 'lucide-react';

interface ChatViewProps {
  threadId: string;
  title: string;
  onRefreshSidebar: () => void;
}

export function ChatView({ threadId, title, onRefreshSidebar }: ChatViewProps) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [thinking, setThinking] = useState(false);
  const [errorRetry, setErrorRetry] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<string | null>(null);

  useEffect(() => {
    const cached = getCachedMessages(threadId);
    setMessages(cached);
    lastMessageRef.current = null;
  }, [threadId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, thinking]);

  const handleSend = useCallback(
    async (content: string) => {
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      appendCachedMessage(threadId, userMessage);
      setThinking(true);
      setErrorRetry(null);

      try {
        const response = await sendMessage(threadId, content);
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
        const errorMsg =
          err && typeof err === 'object' && 'message' in err
            ? (err as { message: string }).message
            : 'Failed to get a response. Try again.';
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
        setThinking(false);
      }
    },
    [threadId, onRefreshSidebar],
  );

  const handleRetry = useCallback(() => {
    if (!errorRetry) return;
    const retryContent = errorRetry;
    // Remove the error message
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
      <div className="border-b border-ink-200 bg-white px-4 py-2.5">
        <div className="mx-auto flex max-w-3xl items-center gap-2">
          <button
            onClick={() => navigate('/app')}
            className="text-sm text-ink-400 hover:text-ink-700"
          >
            PaperWhisper
          </button>
          <span className="text-ink-300">/</span>
          <span className="truncate text-sm font-medium text-ink-800">
            {title}
          </span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl py-4">
          {messages.length === 0 && !thinking ? (
            <div className="pt-16">
              <EmptyState
                icon={<MessageSquare className="h-6 w-6" />}
                title="Start the conversation"
                description="Ask PaperWhisper anything about your uploaded documents."
              />
            </div>
          ) : (
            <div className="space-y-1">
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  onRetry={
                    msg.content.startsWith('__ERROR__') && msg.id === messages[messages.length - 1]?.id
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
