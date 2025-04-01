import mitt from "mitt";

const notificationEmitter = mitt();

/**
 * 🔔 Enviar una notificación global.
 * @param {string} message - El mensaje a mostrar
 * @param {string} type - Tipo de notificación: "info", "success", "error"
 */
export const notify = (message, type = "info") => {
  notificationEmitter.emit("notify", message, type);
};

export { notificationEmitter }; // ⬅️ ESTA ES LA CLAVE
