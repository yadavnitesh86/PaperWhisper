import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser, loginUser, parseAuthError } from '@/lib/api/auth';
import { useAuth } from '@/lib/auth-context';
import { LogoMark } from '@/components/ui/Logo';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AlertCircle, Loader2 } from 'lucide-react';

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
      const user = await loginUser(username.trim(), password);
      setUser(user);
      navigate('/app');
    } catch (err) {
      setError(parseAuthError(err, 'register'));
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
            Start your research
            <br />
            workspace.
          </h2>
          <p className="mt-4 max-w-sm text-ink-500 leading-relaxed">
            Create an account to upload documents and have grounded AI
            conversations about your research.
          </p>
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
              placeholder="Choose a password (min 3 characters)"
              autoComplete="new-password"
              required
              minLength={3}
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
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
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
