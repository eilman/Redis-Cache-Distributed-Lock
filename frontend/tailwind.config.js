/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        redis: {
          50: '#fff0f0',
          100: '#ffe0e0',
          200: '#ffc0c0',
          300: '#ff8080',
          400: '#ff4040',
          500: '#ff2020',
          600: '#e01010',
          700: '#b00808',
          800: '#800404',
          900: '#400202',
        },
        tech: {
          bg: '#050a18',
          surface: '#0a1128',
          card: '#111c38',
          border: '#1a3060',
        },
        neon: {
          cyan: '#00f0ff',
          blue: '#4090ff',
          purple: '#b040ff',
          green: '#00ff88',
          pink: '#ff40a0',
          orange: '#ff8020',
          yellow: '#ffe030',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite alternate',
        'neon-flicker': 'neon-flicker 3s ease-in-out infinite',
        'scan-line': 'scan-line 4s linear infinite',
        'shimmer': 'shimmer 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'glow-pulse': {
          '0%': { opacity: '0.4' },
          '100%': { opacity: '1' },
        },
        'neon-flicker': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
          '75%': { opacity: '1' },
          '90%': { opacity: '0.85' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
