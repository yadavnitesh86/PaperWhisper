import { Link } from 'react-router-dom';

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="7" fill="#1f1d1a" />
      <path
        d="M9 8.5h10l4 4v11a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V9.5a1 1 0 0 1 1-1z"
        stroke="#faf9f5"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M19 8.5v4h4"
        stroke="#faf9f5"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M12 16.5c1.5-1.5 3-1.5 4.5 0M12.8 18.5c.8-.8 1.6-.8 2.4 0"
        stroke="#3385fc"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="14" cy="14.5" r="0.8" fill="#3385fc" />
      <circle cx="14.5" cy="17" r="0.6" fill="#3385fc" />
    </svg>
  );
}

export function LogoWordmark({
  size = 'md',
  to,
}: {
  size?: 'sm' | 'md' | 'lg';
  to?: string;
}) {
  const sizes = {
    sm: { mark: 24, text: 'text-base' },
    md: { mark: 32, text: 'text-lg' },
    lg: { mark: 44, text: 'text-2xl' },
  };
  const s = sizes[size];
  const content = (
    <span className="flex items-center gap-2.5">
      <LogoMark size={s.mark} />
      <span className={`font-bold tracking-tight text-ink-900 ${s.text}`}>
        PaperWhisper
      </span>
    </span>
  );
  if (to) {
    return (
      <Link to={to} className="inline-flex transition-opacity hover:opacity-80">
        {content}
      </Link>
    );
  }
  return content;
}
