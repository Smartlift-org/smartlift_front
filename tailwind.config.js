// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#3a86ff",
        secondary: "#ff006e",
        success: "#38b000",
        warning: "#ffbe0b",
        danger: "#d90429",
        background: "#f8f9fa",
        card: "#ffffff",
        text: "#212529",
        textLight: "#6c757d",
        border: "#ced4da",
      },
      fontFamily: {
        sans: ["System"],
      },
    },
  },
};
