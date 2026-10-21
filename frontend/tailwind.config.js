/** @type {import('tailwind').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        command: {
          bg: "#FFFFFF",
          card: "#F8FAFC",
          border: "#E2E8F0",
          accent: "#0284C7",
          alert: "#DC2626",
          warning: "#D97706",
          success: "#059669",
          purple: "#7C3AED"
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
      }
    },
  },
  plugins: [],
};
