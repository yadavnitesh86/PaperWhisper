export function ThinkingIndicator() {
  return (
    <div className="flex gap-3 animate-fade-in px-4 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-900 text-paper-50 shadow-depth-2">
        <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
          <path
            d="M9 8.5h10l4 4v11a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V9.5a1 1 0 0 1 1-1z"
            stroke="#faf9f5"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M12 16.5c1.5-1.5 3-1.5 4.5 0"
            stroke="#3385fc"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="14" cy="14.5" r="0.8" fill="#3385fc" />
        </svg>
      </div>
      <div className="flex items-center gap-2 py-2">
        <span className="text-sm text-ink-500">PaperWhisper is thinking</span>
        <span className="flex gap-1">
          <span
            className="h-2 w-2 rounded-full bg-accent-500 animate-bounce-dot"
            style={{ animationDelay: '0s' }}
          />
          <span
            className="h-2 w-2 rounded-full bg-accent-500 animate-bounce-dot"
            style={{ animationDelay: '0.16s' }}
          />
          <span
            className="h-2 w-2 rounded-full bg-accent-500 animate-bounce-dot"
            style={{ animationDelay: '0.32s' }}
          />
        </span>
      </div>
    </div>
  );
}
