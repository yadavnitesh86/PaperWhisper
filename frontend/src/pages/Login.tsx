import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, parseAuthError } from '@/lib/api/auth';
import { useAuth } from '@/lib/auth-context';
import { LogoMark } from '@/components/ui/Logo';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AlertCircle, Loader2 } from 'lucide-react';

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
      setError(parseAuthError(err, 'login'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left branding panel */}
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden border-r border-ink-200 bg-paper-50 p-12 lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, #1f1d1a 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
        <Link to="/" className="relative inline-flex items-center gap-2.5">
          <LogoMark size={36} />
          <span className="text-xl font-bold tracking-tight text-ink-900">
            PaperWhisper
          </span>
        </Link>
        <div className="relative">
          <h2 className="text-3xl font-bold tracking-tight text-ink-900">
            Your documents,
            <br />
            one conversation away.
          </h2>
          <p className="mt-4 max-w-sm text-ink-500 leading-relaxed">
            Upload documents and ask PaperWhisper questions grounded in your
            knowledge base.
          </p>
          <div className="mt-8 flex items-center gap-6">
            <div>
              <p className="text-2xl font-bold text-ink-900">3</p>
              <p className="text-xs text-ink-400">Simple steps</p>
            </div>
            <div className="h-8 w-px bg-ink-200" />
            <div>
              <p className="text-2xl font-bold text-ink-900">100%</p>
              <p className="text-xs text-ink-400">Your documents</p>
            </div>
          </div>
        </div>
        <p className="relative text-xs text-ink-400">Document Intelligence</p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center bg-paper-100 p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <LogoMark size={32} />
              <span className="text-lg font-bold tracking-tight text-ink-900">
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
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 animate-slide-down">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 leading-snug">{error}</p>
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
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
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
