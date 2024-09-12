/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'canvas-background': "url('/img/canvas-background.jpg')",
      }
    },
  },
  plugins: [],
}