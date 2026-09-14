import { useRef, useState, type KeyboardEvent } from 'react';
import { Send } from 'lucide-react';

interface ChatComposerProps {
  onSend: (message: string) => void;
  disabled: boolean;
  placeholder?: string;
}

export function ChatComposer({
  onSend,
  disabled,
  placeholder = 'Ask something about your documents...',
}: ChatComposerProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
    }
  };

  return (
    <div className="border-t border-ink-200 bg-paper-50 px-4 py-3">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-end gap-2 rounded-xl border border-ink-200 bg-white p-2 shadow-depth-2 transition-all focus-within:border-accent-500 focus-within:shadow-depth-3">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder={placeholder}
            rows={1}
            disabled={disabled}
            className="flex-1 resize-none border-0 bg-transparent px-2 py-1.5 text-sm text-ink-900 placeholder-ink-400 focus:outline-none disabled:opacity-50"
            aria-label="Message input"
          />
          <button
            onClick={handleSend}
            disabled={!value.trim() || disabled}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-900 text-paper-50 transition-all hover:bg-ink-800 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1.5 px-2 text-xs text-ink-400">
          Enter to send, Shift+Enter for newline
        </p>
      </div>
    </div>
  );
}
