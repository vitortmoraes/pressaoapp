/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          red:    "#FF4D6D",
          orange: "#FF9F1C",
          purple: "#7B2FF7",
          teal:   "#00E5C3",
          dark:   "#1E1E1E",
          gray:   "#A1A1AA",
          light:  "#F5F5F7",
        },
      },
      fontFamily: {
        sans: ["Poppins", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}
