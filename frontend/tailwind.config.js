/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#f0f7f0',
          100: '#dceddc',
          500: '#4a7c59',
          600: '#3d6b4a',
          900: '#1a2e1f',
        }
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
      }
    },
  },
  plugins: [],
}