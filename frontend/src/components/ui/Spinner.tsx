export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' };
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-ink-200 border-t-ink-700 ${sizes[size]}`}
      role="status"
      aria-label="Loading"
    />
  );
}
