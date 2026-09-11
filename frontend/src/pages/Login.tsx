import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '@/lib/api/auth';
import { useAuth } from '@/lib/auth-context';
import { LogoMark } from '@/components/ui/Logo';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    setLoading(true);
    setError(null);
    try {
      const user = await loginUser(username.trim(), password);
      setUser(user);
      navigate('/app');
    } catch (err) {
      const e = err as { status?: number; message?: string; detail?: unknown };
      if (e.status === 400) {
        const detail = e.detail as { detail?: string } | undefined;
        if (detail?.detail === 'LOGIN_BAD_CREDENTIALS') {
          setError('Invalid username or password.');
        } else {
          setError('Invalid username or password.');
        }
      } else if (e.status === 0) {
        setError(
          'Cannot reach the PaperWhisper server. Check your connection and try again.',
        );
      } else {
        setError(e.message || 'Sign in failed. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden flex-1 flex-col justify-between border-r border-ink-200 bg-paper-50 p-12 lg:flex">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <LogoMark size={36} />
          <span className="text-xl font-semibold tracking-tight text-ink-900">
            PaperWhisper
          </span>
        </Link>
        <div>
          <h2 className="text-2xl font-semibold text-ink-900">
            Your documents, one conversation away.
          </h2>
          <p className="mt-3 max-w-sm text-ink-500 leading-relaxed">
            Upload documents and ask PaperWhisper questions grounded in your
            knowledge base.
          </p>
        </div>
        <p className="text-xs text-ink-400">Document Intelligence</p>
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <LogoMark size={32} />
              <span className="text-lg font-semibold tracking-tight text-ink-900">
                PaperWhisper
              </span>
            </Link>
          </div>
          <h1 className="text-xl font-semibold text-ink-900">Sign in</h1>
          <p className="mt-1 text-sm text-ink-500">
            Welcome back. Sign in to continue.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input
              label="Username"
              type="text"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              autoComplete="username"
              required
            />
            <Input
              label="Password"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
              loading={loading}
              disabled={!username.trim() || !password}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-500">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-medium text-accent-700 hover:text-accent-800"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
