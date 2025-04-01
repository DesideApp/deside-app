// 📂 services/notificationService.js

/**
 * Lanza una notificación flotante visible para el usuario.
 * @param {string} message - El texto a mostrar.
 * @param {'info'|'success'|'warning'|'error'} type - El tipo de mensaje (color y estilo).
 */
export const dispatchNotify = (message, type = "info") => {
    const event = new CustomEvent("notify", {
      detail: { message, type },
    });
  
    window.dispatchEvent(event);
  };