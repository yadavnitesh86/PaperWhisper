/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'monospace',
        ],
      },
      colors: {
        ink: {
          50: '#f7f7f6',
          100: '#eeedea',
          200: '#dddbd6',
          300: '#c4c1b9',
          400: '#9f9b8f',
          500: '#7a7568',
          600: '#5d594e',
          700: '#46433b',
          800: '#312f29',
          900: '#1f1d1a',
          950: '#131210',
        },
        paper: {
          50: '#fdfcfa',
          100: '#faf9f5',
          200: '#f5f3ec',
          300: '#ece9de',
          400: '#e0ddd0',
        },
        accent: {
          50: '#eef6ff',
          100: '#d9ebff',
          200: '#bcdcff',
          300: '#8ec5ff',
          400: '#59a5ff',
          500: '#3385fc',
          600: '#1d68f0',
          700: '#1553dc',
          800: '#1745b3',
          900: '#193c8d',
        },
      },
      borderRadius: {
        DEFAULT: '8px',
      },
      boxShadow: {
        'depth-1': '0 1px 2px rgba(31, 29, 26, 0.04), 0 1px 3px rgba(31, 29, 26, 0.06)',
        'depth-2': '0 2px 4px rgba(31, 29, 26, 0.04), 0 4px 12px rgba(31, 29, 26, 0.06)',
        'depth-3': '0 4px 8px rgba(31, 29, 26, 0.06), 0 8px 24px rgba(31, 29, 26, 0.08)',
        'depth-4': '0 8px 16px rgba(31, 29, 26, 0.08), 0 16px 48px rgba(31, 29, 26, 0.10)',
        'inner-depth': 'inset 0 1px 2px rgba(31, 29, 26, 0.04), inset 0 2px 4px rgba(31, 29, 26, 0.03)',
        'glow-accent': '0 0 0 1px rgba(51, 133, 252, 0.15), 0 4px 16px rgba(51, 133, 252, 0.12)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'bounce-dot': {
          '0%, 80%, 100%': { transform: 'scale(0.6)', opacity: '0.4' },
          '40%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slide-down 0.3s ease-out',
        'slide-in-left': 'slide-in-left 0.25s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'float': 'float 4s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-soft': 'pulse-soft 1.5s ease-in-out infinite',
        'bounce-dot': 'bounce-dot 1.4s ease-in-out infinite both',
      },
    },
  },
  plugins: [],
};
