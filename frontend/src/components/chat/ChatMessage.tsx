import { memo, useState } from 'react';
import { Check, Copy, User, AlertCircle, RotateCcw } from 'lucide-react';
import type { Message } from '@/lib/types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ChatMessageProps {
  message: Message;
  onRetry?: () => void;
}

export const ChatMessage = memo(function ChatMessage({
  message,
  onRetry,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isError = message.content.startsWith('__ERROR__');

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (message.role === 'user') {
    return (
      <div className="flex gap-3 animate-slide-up px-4 py-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-500 shadow-depth-1">
          <User className="h-4 w-4" />
        </div>
        <div className="flex-1 pt-1">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-800">
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex gap-3 animate-slide-up px-4 py-3">
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
      <div className="flex-1 min-w-0">
        {isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 shadow-depth-1">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-700">
                  {message.content.replace('__ERROR__', '')}
                </p>
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-700 transition-colors hover:text-red-800"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Retry
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            <MarkdownRenderer content={message.content} />
            <div className="mt-2 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
});
