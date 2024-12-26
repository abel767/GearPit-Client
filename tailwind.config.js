/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", 
    "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'custom-red': '#400707',
        'Hero-title': '#E6E8DA',
      },
      fontFamily: {
        'Roboto-font': ['"Roboto Condensed"', 'sans-serif'],
        'FontSpring': ['"FONTSPRING DEMO - PODIUM Sharp 2.11"', "sans-serif"],        
      },
      keyframes: {
        hover1: {
          '0%, 100%': { transform: 'translateY(0) rotate(-12deg)' },
          '50%': { transform: 'translateY(-20px) rotate(-12deg)' },
        },
        hover2: {
          '0%, 100%': { transform: 'translateY(20px) rotate(12deg)' },
          '50%': { transform: 'translateY(0) rotate(12deg)' },
        },
      },
      animation: {
        hover1: 'hover1 3s ease-in-out infinite',
        hover2: 'hover2 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
