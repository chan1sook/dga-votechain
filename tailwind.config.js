/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
    "./app.vue",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        "dga-blue": {
          lighter: "hsl(250, 57%, 45%)",
          DEFAULT: "#1E154C",
        },
        'dga-orange': "#EE5020",
      }
    },
  },
};
