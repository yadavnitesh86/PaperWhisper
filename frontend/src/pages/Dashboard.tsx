import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  MessageSquare,
  Clock,
  Trash2,
  MoreVertical,
} from 'lucide-react';
import type { ConversationResponse } from '@/lib/types';
import { listChats, deleteChat, createChat } from '@/lib/api/chats';
import { clearCachedMessages } from '@/lib/message-cache';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';

function relativeTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<ConversationResponse[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ConversationResponse | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const chats = await listChats();
      setConversations(chats);
    } catch {
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleNewChat = async () => {
    setCreating(true);
    try {
      const chat = await createChat();
      navigate(`/app/chat/${chat.thread_id}`);
    } catch {
      toast('Failed to create conversation', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteChat(deleteTarget.thread_id);
      clearCachedMessages(deleteTarget.thread_id);
      toast('Conversation deleted', 'success');
      refresh();
    } catch {
      toast('Failed to delete conversation', 'error');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">
            Your documents, one conversation away.
          </h1>
          <p className="mt-2 text-sm text-ink-500 leading-relaxed">
            Upload documents and ask PaperWhisper questions grounded in your
            knowledge base.
          </p>
        </div>

        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <button
            onClick={() => navigate('/app/documents')}
            className="group flex items-start gap-3 rounded-xl border border-ink-200 bg-white p-5 text-left shadow-depth-1 transition-all hover:shadow-depth-2 hover:-translate-y-0.5"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-paper-200 text-ink-500 transition-transform group-hover:scale-110">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-ink-900">Upload Documents</p>
              <p className="mt-0.5 text-sm text-ink-500">
                Add files to your knowledge base
              </p>
            </div>
          </button>
          <button
            onClick={handleNewChat}
            disabled={creating}
            className="group flex items-start gap-3 rounded-xl border border-ink-200 bg-white p-5 text-left shadow-depth-1 transition-all hover:shadow-depth-2 hover:-translate-y-0.5 disabled:opacity-50"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-paper-200 text-ink-500 transition-transform group-hover:scale-110">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-ink-900">
                {creating ? 'Creating...' : 'Start New Conversation'}
              </p>
              <p className="mt-0.5 text-sm text-ink-500">
                Ask PaperWhisper a question
              </p>
            </div>
          </button>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-400">
              Recent Conversations
            </h2>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-xl skeleton" />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="rounded-xl border border-dashed border-ink-200 bg-white px-6 py-12 text-center shadow-depth-1">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-paper-200 text-ink-400">
                <MessageSquare className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-ink-800">
                Start your first conversation
              </p>
              <p className="mt-1 text-sm text-ink-500">
                Upload a document and ask PaperWhisper anything about it.
              </p>
              <Button
                variant="primary"
                size="md"
                className="mt-4"
                onClick={handleNewChat}
                loading={creating}
              >
                New Conversation
              </Button>
            </div>
          ) : (
            <ul className="space-y-1.5">
              {conversations.map((conv) => (
                <li
                  key={conv.thread_id}
                  className="group relative flex items-center gap-3 rounded-xl border border-ink-200 bg-white px-4 py-3 shadow-depth-1 transition-all hover:shadow-depth-2 hover:border-ink-300"
                >
                  <button
                    onClick={() => navigate(`/app/chat/${conv.thread_id}`)}
                    className="flex flex-1 items-center gap-3 text-left"
                  >
                    <MessageSquare className="h-4 w-4 shrink-0 text-ink-400" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink-900">
                        {conv.title}
                      </p>
                      <p className="flex items-center gap-1 text-xs text-ink-400">
                        <Clock className="h-3 w-3" />
                        {relativeTime(conv.updated_at)}
                      </p>
                    </div>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(
                        openMenuId === conv.thread_id ? null : conv.thread_id,
                      );
                    }}
                    className="rounded-md p-1 text-ink-400 opacity-0 transition-all hover:bg-ink-100 hover:text-ink-700 group-hover:opacity-100"
                    aria-label="Conversation menu"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  {openMenuId === conv.thread_id && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setOpenMenuId(null)}
                      />
                      <div className="absolute right-4 top-12 z-20 w-32 rounded-lg border border-ink-200 bg-white py-1 shadow-depth-3 animate-scale-in">
                        <button
                          onClick={() => {
                            navigate(`/app/chat/${conv.thread_id}`);
                            setOpenMenuId(null);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-ink-700 transition-colors hover:bg-ink-50"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          Open
                        </button>
                        <button
                          onClick={() => {
                            setDeleteTarget(conv);
                            setOpenMenuId(null);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-red-600 transition-colors hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete conversation?"
        description="This conversation and its history will be permanently removed."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
