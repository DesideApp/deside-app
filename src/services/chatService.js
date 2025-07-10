import { apiRequest } from "./apiService";

/**
 * 🔹 Obtiene las previews de conversaciones guardadas en el backend.
 * @param {string} pubkey - Clave pública del usuario autenticado
 * @returns {Promise<Array>} Lista de previews de conversaciones
 */
export async function getChatPreviews(pubkey) {
  if (!pubkey) {
    console.warn("⚠️ getChatPreviews llamado sin pubkey.");
    return [];
  }

  return apiRequest(`/api/backup/previews/${pubkey}`, {
    method: "GET",
  });
}
