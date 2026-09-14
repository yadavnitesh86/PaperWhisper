import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-ink-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder-ink-400 transition-all duration-150 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20 ${
            error ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : 'border-ink-200 shadow-depth-1'
          } ${className}`}
          {...props}
        />
        {error && (
          <p className="flex items-center gap-1 text-sm text-red-600 animate-slide-down">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
