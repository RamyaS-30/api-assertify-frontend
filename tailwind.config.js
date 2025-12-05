/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // enable dark mode via class
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#3B82F6', // blue-500
          dark: '#1E3A8A',  // blue-900
        },
        sidebar: {
          light: '#EFF6FF',  // blue-100
          dark: '#1E293B',   // dark-blueish
        },
      },
    },
  },
  plugins: [],
}
