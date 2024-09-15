/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        standard: "black",
        borderColor: "#27272a",
        // standard: "#061e1f",
        // borderColor: "#235045",
      },
    },
    screens: {
      tablet: "0",
      // => @media (min-width: 640px) { ... }

      laptop: "940px",
      // => @media (min-width: 1024px) { ... }

      laptopm: "1262px",
      // => @media (min-width: 1024px) { ... }

      desktop: "1480px",
      // => @media (min-width: 1280px) { ... }
      big: "1780px",
      // => @media (min-width: 1280px) { ... }
    },
  },
  plugins: [require("tailwindcss-animate"), require("tailwind-scrollbar")],
};
