/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      backgroundColor: {
        'primary': '#00A551',
        'background': '#F3F3F3',
      },
      textColor: {
        'primary': '#00A551',
        'black': '#454545'
      },
      borderColor: {
        'primary': '#00A551'
      }
    },
  },
  plugins: [],
}

