/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        border: 'hsl(var(--border))',
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        navy: {
          50:  '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d7fe',
          300: '#a5b4fc',
          400: 'hsl(var(--navy-400))',
          500: '#6366f1',
          600: '#4f46e5',
          700: 'hsl(var(--navy-700))',
          800: 'hsl(var(--navy-800))',
          900: 'hsl(var(--navy-900))',
          950: 'hsl(var(--navy-950))',
        },
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
      },
      keyframes: {
        'aurora-1': {
          '0%, 100%': { transform: 'translate(0,0) scale(1)' },
          '50%':       { transform: 'translate(30px,-20px) scale(1.1)' },
        },
        'aurora-2': {
          '0%, 100%': { transform: 'translate(0,0) scale(1)' },
          '50%':       { transform: 'translate(-30px,20px) scale(1.15)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(-10px)' },
          '50%':      { transform: 'translateY(10px)' },
        },
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'count-up': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
      },
      animation: {
        'aurora-1': 'aurora-1 20s ease-in-out infinite alternate',
        'aurora-2': 'aurora-2 20s ease-in-out infinite alternate',
        float: 'float 6s ease-in-out infinite alternate',
        'fade-in': 'fade-in 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
}
