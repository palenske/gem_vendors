/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: "media",
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1440px",
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: "#00236f",
          container: "#1e3a8a",
          "on-container": "#90a8ff",
        },
        "on-primary": "#ffffff",
        secondary: {
          DEFAULT: "#0058be",
          container: "#2170e4",
          "on-container": "#fefcff",
        },
        "on-secondary": "#ffffff",
        tertiary: {
          DEFAULT: "#00311f",
          container: "#004a31",
          "on-container": "#27c38a",
        },
        "on-tertiary": "#ffffff",
        error: {
          DEFAULT: "#ba1a1a",
          container: "#ffdad6",
          "on-container": "#93000a",
        },
        "on-error": "#ffffff",
        surface: {
          DEFAULT: "#f8f9fa",
          dim: "#d9dadb",
          bright: "#f8f9fa",
          "container-lowest": "#ffffff",
          "container-low": "#f3f4f5",
          container: "#edeeef",
          "container-high": "#e7e8e9",
          "container-highest": "#e1e3e4",
        },
        "on-surface": {
          DEFAULT: "#191c1d",
          variant: "#444651",
        },
        outline: {
          DEFAULT: "#757682",
          variant: "#c5c5d3",
        },
        background: {
          DEFAULT: "#f8f9fa",
          dark: "#191c1d",
        },
        "on-background": "#191c1d",
      },
      fontFamily: {
        inter: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-lg": ["48px", { lineHeight: "56px", fontWeight: "700", letterSpacing: "-0.02em" }],
        "headline-lg": ["32px", { lineHeight: "40px", fontWeight: "700", letterSpacing: "-0.01em" }],
        "headline-lg-mobile": ["24px", { lineHeight: "32px", fontWeight: "700" }],
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "28px" }],
        "body-md": ["16px", { lineHeight: "24px" }],
        "label-md": ["14px", { lineHeight: "20px", fontWeight: "600" }],
        caption: ["12px", { lineHeight: "16px" }],
      },
      spacing: {
        base: "8px",
        xs: "4px",
        sm: "12px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        gutter: "24px",
      },
      borderRadius: {
        sm: "0.125rem",
        DEFAULT: "0.25rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
      boxShadow: {
        "elevation-1": "0 1px 3px rgba(0, 35, 111, 0.08)",
        "elevation-2": "0 4px 6px rgba(0, 35, 111, 0.05)",
        "elevation-3": "0 10px 15px rgba(0, 35, 111, 0.1)",
      },
    },
  },
  plugins: [],
};
