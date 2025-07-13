// 📌 config/theme.js

const THEMES = {
  light: {
    // ✅ Layout sizes
    "--leftbar-collapsed-width": "50px",
    "--leftbar-expanded-width": "350px",
    "--header-height": "60px",
    "--bottom-bar-height": "40px",
    "--layout-padding": "24px",

    // ✅ Colors
    "--background-color": "#f8f6f4",      // tu blanco roto
    "--surface-color": "#e7e3de",         // gris clarito (intermedio)
    "--window-background": "#d9d5d0",     // gris más oscuro para ventanas
    "--text-color": "#2b2323",
    "--highlight-color": "#554646",
    "--secondary-text": "#716965",

    // ✅ Shadows
    "--window-shadow": "0px 4px 12px rgba(0, 0, 0, 0.1)",
    "--content-shadow": "inset 0px 2px 5px rgba(0, 0, 0, 0.08)",

    // ✅ Transitions
    "--transition-speed": "0.3s",
    "--transition-easing": "ease",

    // ✅ Overlays
    "--background-overlay": "rgba(248, 246, 244, 0.2)",
  },
  dark: {
    "--leftbar-collapsed-width": "50px",
    "--leftbar-expanded-width": "350px",
    "--header-height": "60px",
    "--bottom-bar-height": "40px",
    "--layout-padding": "24px",

    "--background-color": "#262424",      // plano de lectura
    "--surface-color": "#1f1d1a",         // intermedio más oscuro
    "--window-background": "#1a1815",     // gris oscuro para ventanas
    "--text-color": "#f0eae6",
    "--highlight-color": "#d1c5bf",
    "--secondary-text": "#b9b2ad",

    "--window-shadow": "0px 4px 12px rgba(0, 0, 0, 0.6)",
    "--content-shadow": "inset 0px 2px 5px rgba(0, 0, 0, 0.5)",

    "--transition-speed": "0.3s",
    "--transition-easing": "ease",

    "--background-overlay": "rgba(38, 36, 36, 0.2)",
  },
};

export function applyTheme(theme) {
  const selectedTheme = THEMES[theme] || THEMES.light;
  Object.keys(selectedTheme).forEach((property) => {
    document.documentElement.style.setProperty(property, selectedTheme[property]);
  });
  localStorage.setItem("theme", theme);
}

export function getPreferredTheme() {
  return (
    localStorage.getItem("theme") ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
  );
}

export function toggleTheme() {
  const currentTheme = getPreferredTheme();
  const newTheme = currentTheme === "light" ? "dark" : "light";
  applyTheme(newTheme);
}

applyTheme(getPreferredTheme());
