/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      screens: { xs: "480px" },
      fontFamily: {
        display: ['"Fraunces Variable"', "Georgia", "serif"],
        sans: ['"DM Sans Variable"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        // Berry-rose: color de marca
        brand: {
          50: "#fdf3f5", 100: "#fbe6ea", 200: "#f6cbd4", 300: "#eea2b4",
          400: "#e2728d", 500: "#d14c6e", 600: "#b5365c", 700: "#972b4c",
          800: "#7d2642", 900: "#681f38",
        },
        // Neutros cálidos (reemplazan a slate)
        ink: {
          50: "#f8f5f3", 100: "#efe9e5", 200: "#ded5cf", 300: "#c3b8b0",
          400: "#9d9087", 500: "#7c6f67", 600: "#61554f", 700: "#4b413d",
          800: "#342d2b", 900: "#231d1d", 950: "#161111",
        },
        cream: "#fbf7f3",
        sand: "#f3ece5",
        leaf: { 50: "#f2f7f2", 100: "#e0ebe0", 500: "#5b8a62", 600: "#46704d", 700: "#385a3e" },
        gold: { 50: "#fdf6e3", 100: "#faeac0", 500: "#c9920e", 600: "#b07a12", 700: "#8a5a0b" },
      },
      boxShadow: {
        soft: "0 1px 2px rgba(35,29,29,.04), 0 8px 24px -12px rgba(35,29,29,.12)",
        lift: "0 2px 4px rgba(35,29,29,.05), 0 18px 40px -16px rgba(35,29,29,.22)",
      },
      keyframes: {
        rise: { from: { opacity: 0, transform: "translateY(8px)" }, to: { opacity: 1, transform: "none" } },
        shimmer: { "100%": { transform: "translateX(100%)" } },
      },
      animation: { rise: "rise .45s cubic-bezier(.2,.7,.2,1) both" },
    },
  },
  plugins: [],
};
