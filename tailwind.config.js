/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      minHeight: {
        'touch': '60px',
        'touch-lg': '80px',
      },
    },
  },
  plugins: [],
}
