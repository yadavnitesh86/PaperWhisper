import { Link } from 'react-router-dom';
import { useRef } from 'react';
import {
  FileText,
  MessageSquare,
  Compass,
  ArrowRight,
  Sparkles,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import { LogoMark } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';

function TiltCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateZ(4px)`;
  };

  const handleLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = '';
  };

  return (
    <div
      ref={ref}
      data-tilt
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={className}
    >
      {children}
    </div>
  );
}

export function Landing() {
  return (
    <div className="min-h-screen bg-paper-100">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-ink-200/60 bg-paper-100/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-2.5">
            <LogoMark size={30} />
            <span className="font-bold tracking-tight text-ink-900">
              PaperWhisper
            </span>
            <span className="ml-1 hidden text-xs text-ink-400 sm:inline">
              Document Intelligence
            </span>
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

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Subtle background pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, #1f1d1a 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative mx-auto max-w-4xl px-6 py-20 text-center sm:py-28">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-3 py-1 text-xs font-medium text-ink-600 shadow-depth-1 animate-slide-down">
            <Sparkles className="h-3.5 w-3.5 text-accent-600" />
            RAG-powered document intelligence
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-ink-900 sm:text-6xl animate-slide-up">
            Talk to your
            <br />
            <span className="relative inline-block">
              documents.
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 300 12"
                fill="none"
                preserveAspectRatio="none"
              >
                <path
                  d="M2 9C50 4 150 2 298 6"
                  stroke="#3385fc"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="animate-fade-in"
                  style={{ animationDelay: '0.3s', animationFillMode: 'both' }}
                />
              </svg>
            </span>
          </h1>

          <p
            className="mx-auto mt-8 max-w-xl text-lg text-ink-500 leading-relaxed animate-slide-up"
            style={{ animationDelay: '0.1s', animationFillMode: 'both' }}
          >
            Upload your documents and explore them through focused AI
            conversations. Get grounded answers from your own knowledge base.
          </p>

          <div
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row animate-slide-up"
            style={{ animationDelay: '0.2s', animationFillMode: 'both' }}
          >
            <Link to="/register">
              <Button variant="primary" size="lg" className="group">
                Start Reading
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Floating document preview */}
      <section className="relative -mt-4 px-6 pb-20">
        <div className="mx-auto max-w-3xl">
          <TiltCard className="rounded-2xl border border-ink-200 bg-white p-5 shadow-depth-3 animate-slide-up" >
            <div className="mb-4 flex items-center gap-2 border-b border-ink-100 pb-3">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-ink-200" />
                <span className="h-3 w-3 rounded-full bg-ink-200" />
                <span className="h-3 w-3 rounded-full bg-ink-200" />
              </div>
              <span className="ml-2 text-xs text-ink-400">
                PaperWhisper workspace
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-500">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div className="flex-1 rounded-lg bg-paper-100 px-4 py-2.5">
                  <p className="text-sm text-ink-700">
                    What are the key findings in this research paper?
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-900 text-paper-50">
                  <LogoMark size={18} />
                </div>
                <div className="flex-1 rounded-lg border border-ink-200 bg-white px-4 py-3 shadow-depth-1">
                  <p className="text-sm text-ink-700">
                    The paper identifies three primary findings: a novel
                    approach to retrieval-augmented generation, significant
                    performance improvements over baseline models, and
                    practical implications for document intelligence
                    systems...
                  </p>
                </div>
              </div>
            </div>
          </TiltCard>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-ink-200 bg-paper-50">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-ink-900">
              How it works
            </h2>
            <p className="mt-2 text-sm text-ink-500">
              Three steps from document to insight.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              {
                icon: FileText,
                title: 'Upload',
                desc: 'Bring your documents into your workspace.',
                step: '01',
              },
              {
                icon: MessageSquare,
                title: 'Ask',
                desc: 'Ask questions in natural language.',
                step: '02',
              },
              {
                icon: Compass,
                title: 'Explore',
                desc: 'Continue conversations around your research.',
                step: '03',
              },
            ].map((feature, i) => (
              <div
                key={feature.title}
                className="group relative rounded-xl border border-ink-200 bg-white p-6 shadow-depth-1 transition-all duration-200 hover:shadow-depth-3 hover:-translate-y-0.5 animate-slide-up"
                style={{
                  animationDelay: `${i * 0.08}s`,
                  animationFillMode: 'both',
                }}
              >
                <span className="absolute right-4 top-4 font-mono text-xs font-medium text-ink-300">
                  {feature.step}
                </span>
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-paper-200 text-ink-500 shadow-depth-1 transition-transform group-hover:scale-110">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-ink-900">
                  {feature.title}
                </h3>
                <p className="mt-1.5 text-sm text-ink-500 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust section */}
      <section className="border-t border-ink-200">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="flex items-start gap-4 rounded-xl border border-ink-200 bg-white p-6 shadow-depth-1">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-ink-900">
                  Private & secure
                </h3>
                <p className="mt-1 text-sm text-ink-500 leading-relaxed">
                  Your documents are associated with your account. The backend
                  derives your identity from your authenticated session.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-xl border border-ink-200 bg-white p-6 shadow-depth-1">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-600">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-ink-900">
                  Grounded answers
                </h3>
                <p className="mt-1 text-sm text-ink-500 leading-relaxed">
                  Responses are based on the documents you upload, not generic
                  knowledge. Your questions, your context.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-ink-200 bg-paper-50">
        <div className="mx-auto max-w-2xl px-6 py-20 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-ink-900">
            Ready to start?
          </h2>
          <p className="mt-2 text-sm text-ink-500">
            Create an account and upload your first document.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/register">
              <Button variant="primary" size="lg" className="group">
                Get Started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink-200 py-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <LogoMark size={22} />
            <span className="text-sm font-medium text-ink-600">
              PaperWhisper
            </span>
          </div>
          <p className="text-xs text-ink-400">Document Intelligence</p>
        </div>
      </footer>
    </div>
  );
}
