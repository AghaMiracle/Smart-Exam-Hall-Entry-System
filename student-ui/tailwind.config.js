/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
      },
      colors: {
        flatBlue: '#3B82F6',
        flatEmerald: '#10B981',
        flatAmber: '#F59E0B',
      },
      scale: {
        '102': '1.02',
      }
    },
  },
  plugins: [],
}
