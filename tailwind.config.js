/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '320px',
        'sm': '480px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      spacing: {
        'touch': '44px', // Minimum touch target size for accessibility
      },
      minHeight: {
        'touch': '44px', // Minimum touch target height for accessibility
      },
      minWidth: {
        'touch': '44px', // Minimum touch target width for accessibility
      },
    },
  },
  plugins: [],
}