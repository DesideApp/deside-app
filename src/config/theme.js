// 📌 config/theme.js

const THEMES = {
  light: {
      "--background-color": "#f8f6f4", // 🔹 Fondo principal (más claro)
      "--window-background": "#ffffff", // 🔹 Fondo de ventanas
      "--text-color": "#2b2323", // 🔹 Color del texto principal
      "--highlight-color": "#554646", // 🔹 Color de resaltados
      "--secondary-text": "#554646", // 🔹 Color de texto secundario
      "--bubble-background": "rgba(255, 255, 255, 0.15)", // 🔹 Fondo de burbujas
      
      // ✅ Sombras y efecto de profundidad
      "--window-shadow": "0px 4px 12px rgba(0, 0, 0, 0.1)",  // 🔹 Sombra de las ventanas
      "--content-shadow": "inset 0px 2px 5px rgba(0, 0, 0, 0.08)", // 🔹 Sombra interna de contenido
      
      // ✅ Transparencia sobre el fondo
      "--background-overlay": "rgba(248, 246, 244, 0.2)", 
  },
  dark: {
      "--background-color": "#262424", // 🔹 Fondo principal (más oscuro)
      "--window-background": "#1a1815", // 🔹 Fondo de ventanas
      "--text-color": "#f0eae6", // 🔹 Color del texto principal
      "--highlight-color": "#d1c5bf", // 🔹 Color de resaltados
      "--secondary-text": "#e6dfda", // 🔹 Color de texto secundario
      "--bubble-background": "rgba(0, 0, 0, 0.3)", // 🔹 Fondo de burbujas
      
      // ✅ Sombras adaptadas al tema oscuro
      "--window-shadow": "0px 4px 12px rgba(255, 255, 255, 0.06)",  // 🔹 Sombra más clara en tema oscuro
      "--content-shadow": "inset 0px 2px 5px rgba(255, 255, 255, 0.05)", // 🔹 Sombra interna más suave
      
      // ✅ Transparencia sobre el fondo oscuro
      "--background-overlay": "rgba(38, 36, 36, 0.2)", 
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
