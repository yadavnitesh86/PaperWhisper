import { Link } from 'react-router-dom';
import { FileText, MessageSquare, Compass } from 'lucide-react';
import { LogoMark } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';

export function Landing() {
  return (
    <div className="min-h-screen bg-paper-100">
      <header className="border-b border-ink-200 bg-paper-50">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-2.5">
            <LogoMark size={30} />
            <span className="font-semibold tracking-tight text-ink-900">
              PaperWhisper
            </span>
            <span className="ml-1 text-xs text-ink-400">Document Intelligence</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">
          Talk to your documents.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-ink-500 leading-relaxed">
          Upload your documents and explore them through focused AI
          conversations.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link to="/register">
            <Button variant="primary" size="lg">
              Start Reading
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary" size="lg">
              Sign In
            </Button>
          </Link>
        </div>
      </section>

      <section className="border-t border-ink-200 bg-paper-50">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-px px-6 py-12 sm:grid-cols-3">
          <div className="px-6 py-4 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-paper-200 text-ink-500">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-ink-900">Upload</h3>
            <p className="mt-1.5 text-sm text-ink-500 leading-relaxed">
              Bring your documents into your workspace.
            </p>
          </div>
          <div className="px-6 py-4 text-center sm:border-x sm:border-ink-200">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-paper-200 text-ink-500">
              <MessageSquare className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-ink-900">Ask</h3>
            <p className="mt-1.5 text-sm text-ink-500 leading-relaxed">
              Ask questions in natural language.
            </p>
          </div>
          <div className="px-6 py-4 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-paper-200 text-ink-500">
              <Compass className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-ink-900">Explore</h3>
            <p className="mt-1.5 text-sm text-ink-500 leading-relaxed">
              Continue conversations around your research.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-ink-200 py-6 text-center">
        <p className="text-xs text-ink-400">
          PaperWhisper — Document Intelligence
        </p>
      </footer>
    </div>
  );
}
