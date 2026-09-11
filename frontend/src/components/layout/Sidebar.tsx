import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, MessageSquare, FileText, Settings, Trash2, MoreVertical, Menu, X } from 'lucide-react';
import type { ConversationResponse } from '@/lib/types';
import { deleteChat } from '@/lib/api/chats';
import { clearCachedMessages } from '@/lib/message-cache';
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

export function Sidebar({ conversations, loading, onRefresh, open, onClose }: SidebarProps) {
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

  const isActive = (threadId: string) => threadId === activeThreadId;

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-ink-900/20 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-ink-200 bg-paper-50 transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between border-b border-ink-200 px-4 py-3">
          <button
            onClick={() => navigate('/app')}
            className="flex items-center gap-2.5"
          >
            <LogoMark size={28} />
            <span className="font-semibold tracking-tight text-ink-900">
              PaperWhisper
            </span>
          </button>
          <button
            onClick={onClose}
            className="text-ink-400 hover:text-ink-700 lg:hidden"
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
          <p className="px-1 pb-2 text-xs font-medium uppercase tracking-wider text-ink-400">
            Conversations
          </p>
          {loading ? (
            <div className="space-y-2 px-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-10 animate-pulse rounded-md bg-ink-100"
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
                <li key={conv.thread_id} className="relative">
                  <button
                    onClick={() => {
                      navigate(`/app/chat/${conv.thread_id}`);
                      onClose();
                    }}
                    className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors ${
                      isActive(conv.thread_id)
                        ? 'bg-ink-100 text-ink-900 font-medium'
                        : 'text-ink-600 hover:bg-ink-50 hover:text-ink-800'
                    }`}
                  >
                    <MessageSquare className="h-4 w-4 shrink-0 text-ink-400" />
                    <span className="flex-1 truncate">{conv.title}</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(
                        openMenuId === conv.thread_id ? null : conv.thread_id,
                      );
                    }}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-1 text-ink-400 hover:bg-ink-200 hover:text-ink-700"
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
                      <div className="absolute right-1.5 top-9 z-20 w-36 rounded-md border border-ink-200 bg-white py-1 shadow-md animate-scale-in">
                        <button
                          onClick={() => {
                            navigate(`/app/chat/${conv.thread_id}`);
                            setOpenMenuId(null);
                            onClose();
                          }}
                          className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-ink-700 hover:bg-ink-50"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          Open
                        </button>
                        <button
                          onClick={() => {
                            setDeleteTarget(conv);
                            setOpenMenuId(null);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
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
              className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors ${
                location.pathname === '/app/documents'
                  ? 'bg-ink-100 text-ink-900 font-medium'
                  : 'text-ink-600 hover:bg-ink-50 hover:text-ink-800'
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
              className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors ${
                location.pathname === '/app/settings'
                  ? 'bg-ink-100 text-ink-900 font-medium'
                  : 'text-ink-600 hover:bg-ink-50 hover:text-ink-800'
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
      className="rounded-md p-2 text-ink-600 hover:bg-ink-100 lg:hidden"
      aria-label="Open sidebar"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}
