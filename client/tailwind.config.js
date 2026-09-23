/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Fibax Logo Primary Orange ("Fibax" & "V")
        brand: {
          DEFAULT: '#ea580c',     // Vibrant Fibax Orange from logo
          hover: '#c2410c',       // Deep rich orange for hover states
          dark: '#9a3412',        // Burnt orange / terracotta
          light: '#f97316',       // Bright sun orange
          soft: '#fff7ed',        // Soft peach/cream background
          border: '#fed7aa',      // Subtle orange border
          subtle: '#ffedd5',      // Warm light tint
        },
        // Fibax Logo Deep Forest Green ("AYURVEDA" text & dark leaf)
        forest: {
          DEFAULT: '#084d2f',     // Deep authentic botanical green
          deep: '#042f1d',        // Header/Footer dark green
          dark: '#063e26',        // Rich herbal container
          light: '#0f6841',       // Hover green
          muted: '#1b4332',
        },
        // Fibax Logo Fresh Lime Leaf (light leaf & sprout dot on "i")
        leaf: {
          DEFAULT: '#84cc16',     // Fresh lime green
          light: '#a3e635',       // Vibrant sprout green
          dark: '#65a30d',        // Herbal stem green
          soft: '#f7fee7',        // Soft mint leaf background
          border: '#d9f99d',      // Lime border
        },
        sage: {
          DEFAULT: '#15803d',     // Natural herbal green
          light: '#16a34a',
          soft: '#f0fdf4',
          muted: '#dcfce7',
        },
        gold: {
          DEFAULT: '#d97706',     // Amber gold for ratings & seals
          dark: '#b45309',
          light: '#fde68a',
          cream: '#fef3c7',
        },
        crimson: {
          DEFAULT: '#dc2626',
          dark: '#b91c1c',
          light: '#f87171',
        },
        charcoal: {
          DEFAULT: '#1c1917',     // Sophisticated warm dark text
          soft: '#292524',
          muted: '#57534e',
          subtle: '#78716c',
        },
        sand: {
          DEFAULT: '#fafaf9',     // Clean warm stone/sand
          warm: '#fbfaf8',
          border: '#e7e5e4',
        }
      },
      fontFamily: {
        sans: ['"Poppins"', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Inter"', 'sans-serif'],
        heading: ['"Inter"', 'sans-serif'],
        inter: ['"Inter"', 'sans-serif'],
        poppins: ['"Poppins"', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'subtle': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'botanical': '0 12px 28px rgba(8, 77, 47, 0.12)',
        'orange-glow': '0 8px 24px rgba(234, 88, 12, 0.25)',
        'modal': '0 20px 50px rgba(0, 0, 0, 0.16)',
      }
    },
  },
  plugins: [],
};
