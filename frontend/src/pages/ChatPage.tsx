import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { ConversationResponse } from '@/lib/types';
import { getChat } from '@/lib/api/chats';
import { ChatView } from '@/components/chat/ChatView';
import { Spinner } from '@/components/ui/Spinner';

interface ChatPageProps {
  onRefreshSidebar: () => void;
}

export function ChatPage({ onRefreshSidebar }: ChatPageProps) {
  const { threadId } = useParams<{ threadId: string }>();
  const [conversation, setConversation] = useState<ConversationResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!threadId) return;
    setLoading(true);
    setError(null);
    try {
      const conv = await getChat(threadId);
      setConversation(conv);
    } catch (err) {
      const e = err as { status?: number; message?: string };
      if (e.status === 404) {
        setError('Conversation not found.');
      } else {
        setError(e.message || 'Failed to load conversation.');
      }
    } finally {
      setLoading(false);
    }
  }, [threadId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !conversation || !threadId) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center">
          <p className="text-sm text-ink-500">
            {error || 'Conversation not found.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <ChatView
      threadId={threadId}
      title={conversation.title}
      onRefreshSidebar={onRefreshSidebar}
    />
  );
}
