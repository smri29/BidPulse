/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bid-purple': '#6366f1', // Indigo-500 (Bidder Primary)
        'bid-green': '#10b981',  // Emerald-500 (Seller Primary)
        'bid-dark': '#0f172a',   // Slate-900 (Admin/Footer)
      }
    },
  },
  plugins: [],
}