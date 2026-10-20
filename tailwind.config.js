/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'obsidian': '#09090B',
        'apex-red': '#FF2800',
        'electric-blue': '#38BDF8',
        'terra-amber': '#F59E0B',
        'electric-volt': '#CCFF00'
      }
    },
  },
  plugins: [],
}