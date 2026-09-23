/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        amsterdam: {
          red: '#9E002B',
          'red-hover': '#800023',
          'red-light': '#FFF0F3',
          lime: '#7BAE27',
          'lime-bright': '#8CE033',
          'lime-light': '#EBF7D4',
          olive: '#4F772D',
          'olive-dark': '#31572C',
          bg: '#F9FAF7',
          muted: '#F1F5E9',
          dark: '#191C1E',
          textMuted: '#5E646A'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
        'card-hover': '0 12px 30px -4px rgba(0, 0, 0, 0.1), 0 4px 12px -2px rgba(0, 0, 0, 0.05)',
        'hero-3d': '0 10px 25px rgba(123, 174, 39, 0.35)',
        'crimson': '0 10px 30px -5px rgba(158, 0, 43, 0.3)'
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      }
    },
  },
  plugins: [],
}
