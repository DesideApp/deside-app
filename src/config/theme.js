// 📌 config/theme.js

const THEMES = {
    light: {
      "--background-color": "#f8f6f4", // 🔹 Fondo principal (más claro)
      "--window-background": "#ffffff", // 🔹 Fondo de ventanas
      "--text-color": "#2b2323", // 🔹 Color del texto principal
      "--highlight-color": "#554646", // 🔹 Color de resaltados
      "--secondary-text": "#554646", // 🔹 Color de texto secundario
      "--bubble-background": "rgba(255, 255, 255, 0.15)", // 🔹 Fondo de burbujas
    },
    dark: {
      "--background-color": "#352f2f", // 🔹 Fondo principal (más oscuro)
      "--window-background": "#262020", // 🔹 Fondo de ventanas (más claro que el fondo general)
      "--text-color": "#e6dfda", // 🔹 Color del texto principal
      "--highlight-color": "#d1c5bf", // 🔹 Color de resaltados (ligeramente más claro para contraste)
      "--secondary-text": "#e6dfda", // 🔹 Color de texto secundario
      "--bubble-background": "rgba(0, 0, 0, 0.3)", // 🔹 Fondo de burbujas
    },
  };
  
  /**
   * 🔹 **Aplica un tema al documento**
   * @param {"light" | "dark"} theme
   */
  export function applyTheme(theme) {
    const selectedTheme = THEMES[theme] || THEMES.light;
    Object.keys(selectedTheme).forEach((property) => {
      document.documentElement.style.setProperty(property, selectedTheme[property]);
    });
    localStorage.setItem("theme", theme); // ✅ Guarda preferencia del usuario
  }
  
  /**
   * 🔹 **Obtiene el tema guardado o detecta el del sistema**
   * @returns {"light" | "dark"}
   */
  export function getPreferredTheme() {
    return localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }
  
  /**
   * 🔹 **Alterna entre modo claro y oscuro**
   */
  export function toggleTheme() {
    const currentTheme = getPreferredTheme();
    const newTheme = currentTheme === "light" ? "dark" : "light";
    applyTheme(newTheme);
  }
  
  // ✅ Aplica el tema al cargar la app
  applyTheme(getPreferredTheme());
  