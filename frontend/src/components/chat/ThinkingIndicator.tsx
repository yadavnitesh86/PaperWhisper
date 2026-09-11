export function ThinkingIndicator() {
  return (
    <div className="flex gap-3 animate-fade-in px-4 py-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-ink-900 text-paper-50">
        <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
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
      <div className="flex items-center gap-1.5 py-2">
        <span className="text-sm text-ink-500">PaperWhisper is thinking</span>
        <span className="flex gap-1">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-400 [animation-delay:-0.3s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-400 [animation-delay:-0.15s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-400" />
        </span>
      </div>
    </div>
  );
}
