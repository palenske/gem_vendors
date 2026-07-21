/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  // Sincronizado com prefers-color-scheme do SO (ver decisão #4 do brainstorm).
  darkMode: "media",
  theme: {
    // Breakpoints do projeto: sm=640, md=768 (split view do ResponsiveShell), lg=1024.
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
    },
    extend: {},
  },
  plugins: [],
};
