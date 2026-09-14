import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ConversationResponse } from '@/lib/types';
import { listChats } from '@/lib/api/chats';
import { useAuth } from '@/lib/auth-context';
import { clearAllChatTitles } from '@/lib/chat-titles';
import { Sidebar, SidebarToggle } from './Sidebar';
import { UserMenu } from './UserMenu';

interface AppShellProps {
  children: ReactNode;
  refreshKey?: number;
}

export function AppShell({ children, refreshKey = 0 }: AppShellProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const refreshConversations = useCallback(async () => {
    setConversationsLoading(true);
    try {
      const chats = await listChats();
      setConversations(chats);
    } catch {
      setConversations([]);
    } finally {
      setConversationsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshConversations();
  }, [refreshConversations, refreshKey]);

  const handleLogout = () => {
    clearAllChatTitles();
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-paper-100">
      <header className="flex items-center justify-between border-b border-ink-200 bg-paper-50 px-4 py-2.5 shadow-depth-1">
        <div className="flex items-center gap-2">
          <SidebarToggle onClick={() => setSidebarOpen(true)} />
        </div>
        <div className="flex items-center gap-3">
          {user && <UserMenu username={user.username} onLogout={handleLogout} />}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          conversations={conversations}
          loading={conversationsLoading}
          onRefresh={refreshConversations}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
