/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      spacing: {
        4.5: "1.125rem",
        5.5: "1.375rem",
        6.5: "1.625rem",
        7.5: "1.875rem",
        8.5: "2.125rem",
      },
      colors: {
        ink: "#16232E",
        navy: "#1F3A50",
        navylight: "#274A66",
        teal: "#008693",
        tealdeep: "#00636D",
        slate: "#5A6B75",
        paper: "#F2F4F5",
        line: "#DDE3E7",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
