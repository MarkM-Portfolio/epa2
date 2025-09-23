/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx,html}',
  ],
  theme: {
    extend: {
      fontFamily:{
        'montserrat': ['Montserrat']
      },
      colors: {
        'secondary-emerald': '#50C878'
      }
    },
  },
  plugins: [],
}
