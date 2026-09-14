import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Settings, LogOut } from 'lucide-react';

interface UserMenuProps {
  username: string;
  onLogout: () => void;
}

export function UserMenu({ username, onLogout }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-sm text-ink-700 shadow-depth-1 transition-all hover:shadow-depth-2 hover:bg-paper-100"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink-900 text-xs font-semibold text-paper-50">
          {username.charAt(0).toUpperCase()}
        </span>
        <span className="max-w-[120px] truncate font-medium">{username}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-ink-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-48 rounded-xl border border-ink-200 bg-white py-1 shadow-depth-3 animate-scale-in">
          <div className="border-b border-ink-100 px-3 py-2.5">
            <p className="text-xs text-ink-400">Signed in as</p>
            <p className="truncate text-sm font-medium text-ink-900">{username}</p>
          </div>
          <button
            onClick={() => {
              navigate('/app/settings');
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-ink-700 transition-colors hover:bg-ink-50"
          >
            <Settings className="h-3.5 w-3.5" />
            Settings
          </button>
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
