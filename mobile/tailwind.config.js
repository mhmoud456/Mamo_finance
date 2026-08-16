module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#f8fafc",
        foreground: "#0f172a",
        muted: "#64748b",
        primary: "#0f766e",
        "primary-foreground": "#ffffff",
        surface: "#ffffff",
        border: "#e2e8f0",
        success: "#16a34a",
        warning: "#d97706",
        error: "#e11d48",
      },
    },
  },
  plugins: [],
};
