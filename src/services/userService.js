import { apiRequest } from "./apiService";

/**
 * 🔍 Busca un usuario por su pubkey.
 *
 * @param {string} pubkey - Clave pública del usuario a buscar.
 * @returns {Promise<object>} Objeto con los datos del usuario:
 *   - registered: boolean
 *   - pubkey: string | null
 *   - relationship: "confirmed" | "pending" | "none"
 *   - blocked: boolean
 *   - nickname: string | null
 *   - avatar: string | null
 *   - error: boolean
 *   - message: string | null
 */
export async function searchUserByPubkey(pubkey) {
  if (!pubkey) {
    return {
      error: true,
      message: "Pubkey requerida.",
    };
  }

  // Validar formato de pubkey (Solana)
  if (!/^([1-9A-HJ-NP-Za-km-z]{32,44})$/.test(pubkey)) {
    return {
      error: true,
      message: "Pubkey inválida.",
    };
  }

  // Hacer la llamada real al backend
  const response = await apiRequest(`/api/users/${pubkey}`, {
    method: "GET",
  });

  if (response?.error) {
    return {
      error: true,
      message: response.message || "Error consultando usuario.",
    };
  }

  // Si no existe en la base de datos
  if (response?.registered === false) {
    return {
      error: false,
      registered: false,
      pubkey: null,
      relationship: "none",
      blocked: false,
      nickname: null,
      avatar: null,
      message: "Usuario no registrado.",
    };
  }

  // Usuario encontrado
  return {
    error: false,
    registered: true,
    pubkey: response.pubkey,
    relationship: response.relationship || "none",
    blocked: response.blocked || false,
    nickname: response.nickname || null,
    avatar: response.avatar || null,
    message: null,
  };
}
