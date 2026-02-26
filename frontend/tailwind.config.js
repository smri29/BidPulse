/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bid-purple': '#0f6fff',
        'bid-green': '#059669',
        'bid-dark': '#0b1220',
      }
    },
  },
  plugins: [],
}
