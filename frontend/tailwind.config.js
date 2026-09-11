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
        },
        paper: {
          50: '#fdfcfa',
          100: '#faf9f5',
          200: '#f5f3ec',
          300: '#ece9de',
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
        DEFAULT: '6px',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-up': 'slide-up 0.25s ease-out',
        'slide-in-left': 'slide-in-left 0.2s ease-out',
        'scale-in': 'scale-in 0.15s ease-out',
        'pulse-soft': 'pulse-soft 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
