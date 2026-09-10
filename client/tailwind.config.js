/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#1b4332',
          deep: '#081c15',
          dark: '#143628',
          light: '#2d6a4f',
        },
        sage: {
          DEFAULT: '#52b788',
          light: '#74c69d',
          soft: '#d8f3dc',
          muted: '#e8f7ec',
        },
        gold: {
          DEFAULT: '#d4a373',
          dark: '#b08968',
          light: '#e9d8a6',
          cream: '#fefae0',
        },
        amber: {
          warm: '#e76f51',
          soft: '#f4a261',
        },
        crimson: {
          DEFAULT: '#c9184a',
          dark: '#a4133c',
          light: '#ff758f',
        },
        charcoal: {
          DEFAULT: '#1a1a1a',
          soft: '#2b2b2b',
          muted: '#59655f',
          subtle: '#8b9791',
        },
        sand: {
          DEFAULT: '#f4f6f3',
          warm: '#f8f9fa',
          border: '#e5e9e6',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'subtle': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'botanical': '0 12px 24px rgba(27, 67, 50, 0.08)',
        'modal': '0 20px 50px rgba(0, 0, 0, 0.15)',
      }
    },
  },
  plugins: [],
};
