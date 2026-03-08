/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'bid-purple': '#1a5fff',
        'bid-green': '#0d9b90',
        'bid-dark': '#0a1631',
        'bid-gold': '#c89435',
      },
    },
  },
  plugins: [],
};
