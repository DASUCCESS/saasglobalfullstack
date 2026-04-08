/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: "#ffbb00",
          black: "#000000",
          white: "#FFFFFF",
          gray: "#F5F5F5",
        },
      },
      boxShadow: {
        card: "0 10px 25px rgba(0,0,0,0.08)",
        hover: "0 15px 30px rgba(0,0,0,0.12)",
      },
      transitionTimingFunction: {
        "in-out-expo": "cubic-bezier(0.87, 0, 0.13, 1)",
      },
    },
  },
  plugins: [],
};