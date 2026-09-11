import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '@/lib/api/auth';
import { loginUser } from '@/lib/api/auth';
import { useAuth } from '@/lib/auth-context';
import { LogoMark } from '@/components/ui/Logo';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function Register() {
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
      await registerUser(username.trim(), password);
      // Auto-login after successful registration
      const user = await loginUser(username.trim(), password);
      setUser(user);
      navigate('/app');
    } catch (err) {
      const e = err as { status?: number; message?: string; detail?: unknown };
      if (e.status === 400) {
        const detail = e.detail as { detail?: string } | undefined;
        if (detail?.detail === 'REGISTER_USER_ALREADY_EXISTS') {
          setError('This username is already taken.');
        } else if (detail?.detail && typeof detail.detail === 'object' && 'reason' in (detail.detail as Record<string, unknown>)) {
          setError((detail.detail as { reason: string }).reason);
        } else {
          setError('This username is already taken.');
        }
      } else if (e.status === 422) {
        setError('Please check the information you entered.');
      } else {
        setError(e.message || 'Registration failed. Try again.');
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
            Start your research workspace.
          </h2>
          <p className="mt-3 max-w-sm text-ink-500 leading-relaxed">
            Create an account to upload documents and have grounded AI
            conversations about your research.
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
          <h1 className="text-xl font-semibold text-ink-900">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Get started with PaperWhisper.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input
              label="Username"
              type="text"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              autoComplete="username"
              required
            />
            <Input
              label="Password"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Choose a password"
              autoComplete="new-password"
              required
              minLength={3}
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
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-accent-700 hover:text-accent-800"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
