/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          300: '#F5D67D',
          400: '#E6C665',
          500: '#D4AF37',
          600: '#B8860B',
        },
        cafe: {
          accent: '#2A1810',
          bg: '#16120F',
        },
        restaurant: {
          accent: '#3D0C0C',
          bg: '#180A0A',
        },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Playfair Display', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      screens: {
        xs: '475px',
      },
    },
  },
  plugins: [],
};
