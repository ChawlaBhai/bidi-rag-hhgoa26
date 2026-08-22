/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#000000",
        paper: "#FFFFFF",
        accent: {
          blue: "#2563EB",
          pink: "#DB2777",
          green: "#059669",
          orange: "#EA580C"
        }
      },
      boxShadow: {
        'neo': '4px 4px 0px 0px #000000',
        'neo-lg': '8px 8px 0px 0px #000000',
        'neo-hover': '2px 2px 0px 0px #000000',
        'neo-blue': '4px 4px 0px 0px #2563EB',
        'neo-pink': '4px 4px 0px 0px #DB2777',
        'neo-green': '4px 4px 0px 0px #059669',
      },
      borderWidth: {
        '2': '2px',
        '3': '3px',
        '4': '4px',
      }
    },
  },
  plugins: [],
}
