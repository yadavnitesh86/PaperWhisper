import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { clearAllCachedMessages } from '@/lib/message-cache';
import { clearUploadHistory } from '@/lib/upload-history';
import { clearAllChatTitles } from '@/lib/chat-titles';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [confirmLogout, setConfirmLogout] = useState(false);

  const handleLogout = () => {
    clearAllCachedMessages();
    clearAllChatTitles();
    if (user) clearUploadHistory(user.id);
    logout();
    navigate('/login');
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">
          Settings
        </h1>

        <div className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-400">
            Account
          </h2>
          <div className="mt-3 rounded-xl border border-ink-200 bg-white shadow-depth-1">
            <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
              <span className="text-sm text-ink-500">Username</span>
              <span className="text-sm font-medium text-ink-900">
                {user?.username || '—'}
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-ink-500">Email</span>
              <span className="text-sm font-medium text-ink-900">
                {user?.email || '—'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-400">
            Authentication
          </h2>
          <div className="mt-3 rounded-xl border border-ink-200 bg-white p-4 shadow-depth-1">
            <p className="text-sm text-ink-500">
              Sign out of your account on this device.
            </p>
            <Button
              variant="danger"
              size="md"
              className="mt-3"
              onClick={() => setConfirmLogout(true)}
            >
              Sign out
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmLogout}
        title="Sign out?"
        description="You'll need to sign in again to access your workspace."
        confirmLabel="Sign out"
        variant="danger"
        onConfirm={handleLogout}
        onCancel={() => setConfirmLogout(false)}
      />
    </div>
  );
}
