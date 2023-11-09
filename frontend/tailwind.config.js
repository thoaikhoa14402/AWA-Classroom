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
        'hover': '#1C6B43',
        'redx': '#FF0000',
        'bluex': '#0000FF',
        'pinkx': '#FFC0CB',
        'purplex': '#800080'
      },
      textColor: {
        'primary': '#00A551',
        'black': '#454545',
        'hover': '#16C26B',
        'hover-dark': '#0F8046'
      },
      borderColor: {
        'primary': '#00A551'
      },
      inset: {
        'mbsize': '7.3rem auto auto auto',
        'desksize': '4.1rem auto auto auto'
      } 
    },
  },
  plugins: [],
}

