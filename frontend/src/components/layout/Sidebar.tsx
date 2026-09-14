import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Plus,
  MessageSquare,
  FileText,
  Settings,
  Trash2,
  MoreVertical,
  X,
} from 'lucide-react';
import type { ConversationResponse } from '@/lib/types';
import { deleteChat } from '@/lib/api/chats';
import { clearCachedMessages } from '@/lib/message-cache';
import { clearChatTitle, getChatTitle } from '@/lib/chat-titles';
import { LogoMark } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';

interface SidebarProps {
  conversations: ConversationResponse[];
  loading: boolean;
  onRefresh: () => void;
  open: boolean;
  onClose: () => void;
}

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

export function Sidebar({
  conversations,
  loading,
  onRefresh,
  open,
  onClose,
}: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [deleteTarget, setDeleteTarget] = useState<ConversationResponse | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const activeThreadId = location.pathname.match(/\/app\/chat\/(.+)/)?.[1];

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteChat(deleteTarget.thread_id);
      clearCachedMessages(deleteTarget.thread_id);
      clearChatTitle(deleteTarget.thread_id);
      toast('Conversation deleted', 'success');
      if (activeThreadId === deleteTarget.thread_id) {
        navigate('/app');
      }
      onRefresh();
    } catch {
      toast('Failed to delete conversation', 'error');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-ink-900/20 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-ink-200 bg-paper-50 transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between border-b border-ink-200 px-4 py-3.5">
          <button
            onClick={() => {
              navigate('/app');
              onClose();
            }}
            className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
          >
            <LogoMark size={28} />
            <span className="font-bold tracking-tight text-ink-900">
              PaperWhisper
            </span>
          </button>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-3 pt-3">
          <Button
            variant="primary"
            size="md"
            className="w-full"
            onClick={() => {
              navigate('/app');
              onClose();
            }}
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>

        <div className="mt-4 flex-1 overflow-y-auto px-3">
          <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-wider text-ink-400">
            Conversations
          </p>
          {loading ? (
            <div className="space-y-2 px-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-11 rounded-lg skeleton"
                />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <p className="px-1 py-4 text-sm text-ink-400">
              No conversations yet.
            </p>
          ) : (
            <ul className="space-y-0.5">
              {conversations.map((conv) => (
                <li key={conv.thread_id} className="group relative">
                  <button
                    onClick={() => {
                      navigate(`/app/chat/${conv.thread_id}`);
                      onClose();
                    }}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-left text-sm transition-all duration-150 ${
                      conv.thread_id === activeThreadId
                        ? 'bg-white text-ink-900 font-medium shadow-depth-1 border border-ink-200'
                        : 'text-ink-600 hover:bg-ink-100 hover:text-ink-800'
                    }`}
                  >
                    <MessageSquare
                      className={`h-4 w-4 shrink-0 ${
                        conv.thread_id === activeThreadId
                          ? 'text-accent-600'
                          : 'text-ink-400'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="truncate">{conv.title}</p>
                      <p className="text-xs text-ink-400">
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
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-ink-400 opacity-0 transition-all hover:bg-ink-200 hover:text-ink-700 group-hover:opacity-100"
                    aria-label="Conversation menu"
                  >
                    <MoreVertical className="h-3.5 w-3.5" />
                  </button>
                  {openMenuId === conv.thread_id && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setOpenMenuId(null)}
                      />
                      <div className="absolute right-1.5 top-12 z-20 w-36 rounded-lg border border-ink-200 bg-white py-1 shadow-depth-3 animate-scale-in">
                        <button
                          onClick={() => {
                            navigate(`/app/chat/${conv.thread_id}`);
                            setOpenMenuId(null);
                            onClose();
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

        <div className="border-t border-ink-200 px-3 py-3">
          <nav className="space-y-0.5">
            <button
              onClick={() => {
                navigate('/app/documents');
                onClose();
              }}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-all duration-150 ${
                location.pathname === '/app/documents'
                  ? 'bg-white text-ink-900 font-medium shadow-depth-1 border border-ink-200'
                  : 'text-ink-600 hover:bg-ink-100 hover:text-ink-800'
              }`}
            >
              <FileText className="h-4 w-4 text-ink-400" />
              Documents
            </button>
            <button
              onClick={() => {
                navigate('/app/settings');
                onClose();
              }}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-all duration-150 ${
                location.pathname === '/app/settings'
                  ? 'bg-white text-ink-900 font-medium shadow-depth-1 border border-ink-200'
                  : 'text-ink-600 hover:bg-ink-100 hover:text-ink-800'
              }`}
            >
              <Settings className="h-4 w-4 text-ink-400" />
              Settings
            </button>
          </nav>
        </div>
      </aside>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete conversation?"
        description="This conversation and its history will be permanently removed."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </>
  );
}

export function SidebarToggle({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg p-2 text-ink-600 transition-colors hover:bg-ink-100 lg:hidden"
      aria-label="Open sidebar"
    >
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );
}
