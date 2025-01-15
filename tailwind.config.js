/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", 
    "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'custom-red': '#400707',
        'Hero-title': '#E6E8DA',
        'minBlack' : '#202020',
        'heroBlack': '#0B0B0B',
        'minGrey': '#f8f8f8'
      },
      fontFamily: {
        'Roboto-font': ['"Roboto Condensed"', 'sans-serif'],
        'FontSpring': ['"FONTSPRING DEMO - PODIUM Sharp 2.11"', "sans-serif"],    
        'anonymous-pro': ['"Anonymous Pro"', 'sans-serif'],

      },
      keyframes: {
        hover1: {
          '0%, 100%': { transform: 'translateY(0) rotate(-2deg)' },
          '50%': { transform: 'translateY(-30px) rotate(-2deg)' },
        },
      },
      animation: {
        hover1: 'hover1 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
