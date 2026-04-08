/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: '#1E2846',
        'navy-panel': '#141E35',
        gold: '#DCB96E',
        'txt-primary': '#FFFFFF',
        'txt-secondary': '#A0AEC0',
        'pos': '#4CAF7D',
        'neg': '#C94040',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
