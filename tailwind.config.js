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
        navylight: "#4C86EE",
        teal: "#2FA84F",
        tealdeep: "#1F7A38",
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
