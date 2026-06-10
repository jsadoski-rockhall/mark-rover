module.exports = {
  content: ["./index.html", "./src/**/*.{svelte,ts}"],
  darkMode: "media",
  theme: {
    extend: {
      fontFamily: {
        reader: ["Georgia", "Cambria", "Times New Roman", "serif"],
        ui: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};
