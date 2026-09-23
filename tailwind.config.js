/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // VeraOS Official Color System
        vera: {
          bg: "#160C08",        // Primary background
          deep: "#21110B",      // Deep brown
          cocoa: "#2C1710",     // Cocoa
          surface: "#3A2015",   // Surface
          elevated: "#4A2819",  // Elevated
          warm: "#63361F",      // Warm brown
          primary: "#C96A2B",   // Primary orange
          bright: "#E08A3E",    // Bright orange
          amber: "#E6A15A",     // Amber
          cream: "#F3E5D5",     // Cream
          white: "#FFF8F0",     // Warm white
          muted: "#B9A99B",     // Muted text
          border: "#4A2B1D",    // Border
        },

        // Theme semantic mappings
        background: "#160C08",
        surface: "#21110B",
        "surface-container-lowest": "#160C08",
        "surface-container-low": "#21110B",
        "surface-container": "#2C1710",
        "surface-container-high": "#3A2015",
        "surface-container-highest": "#4A2819",
        "on-background": "#FFF8F0",
        "on-surface": "#FFF8F0",
        "on-surface-variant": "#B9A99B",
        outline: "#B9A99B",
        "outline-variant": "#4A2B1D",

        // Verification Accents
        primary: {
          DEFAULT: "#C96A2B",
          hover: "#E08A3E",
          active: "#B85C20",
          container: "#C96A2B",
        },
        secondary: {
          DEFAULT: "#E08A3E",
          hover: "#E6A15A",
          container: "#2C1710",
        },
        status: {
          verified: "#4ade80",
          "verified-bg": "#142818",
          "verified-border": "#1b4324",
          failed: "#f87171",
          "failed-bg": "#2a1210",
          "failed-border": "#5c1e19",
          unverifiable: "#E6A15A",
          "unverifiable-bg": "#2b1c10",
          "unverifiable-border": "#54331a",
        },
        error: {
          DEFAULT: "#f87171",
          container: "#2a1210",
          "on-error-container": "#fca5a5",
        },
      },
      fontFamily: {
        heading: ["Poppins", "sans-serif"],
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
        "code-sm": ["JetBrains Mono", "monospace"],
        "code-md": ["JetBrains Mono", "monospace"],
        "body-sm": ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "label-caps": ["Poppins", "sans-serif"],
        "headline-sm": ["Poppins", "sans-serif"],
        "headline-md": ["Poppins", "sans-serif"],
        "headline-lg": ["Poppins", "sans-serif"],
        "display-hero": ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
}
