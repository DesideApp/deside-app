// src/services/backupService.js

import crypto from "crypto-js";
import { apiRequest } from "./apiService.js";

/**
 * ✅ Deriva la clave AES-256 desde la firma + pubkey.
 * @param {string} signature - Firma base58
 * @param {string} pubkey - Clave pública
 * @returns {crypto.lib.WordArray} Clave derivada
 */
export function deriveEncryptionKey(signature, pubkey) {
  return crypto.PBKDF2(signature, crypto.enc.Utf8.parse(pubkey), {
    keySize: 256 / 32,
    iterations: 100000,
    hasher: crypto.algo.SHA256,
  });
}

/**
 * ✅ Cifra un objeto JSON usando AES-256-GCM.
 * @param {Object} data - Objeto JSON a cifrar
 * @param {crypto.lib.WordArray} key - Clave derivada
 * @returns {Object} Objeto cifrado
 */
export function encryptBackupData(data, key) {
  const iv = crypto.lib.WordArray.random(12);

  const encrypted = crypto.AES.encrypt(
    JSON.stringify(data),
    key,
    {
      iv,
      mode: crypto.mode.GCM,
      format: crypto.format.OpenSSL,
    }
  );

  return {
    iv: iv.toString(crypto.enc.Hex),
    ciphertext: encrypted.ciphertext.toString(crypto.enc.Hex),
  };
}

/**
 * ✅ Descifra un objeto JSON cifrado.
 * @param {Object} encryptedData - { iv, ciphertext }
 * @param {crypto.lib.WordArray} key - Clave derivada
 * @returns {Object} JSON descifrado
 */
export function decryptBackupData(encryptedData, key) {
  const iv = crypto.enc.Hex.parse(encryptedData.iv);
  const ciphertext = crypto.enc.Hex.parse(encryptedData.ciphertext);

  const decrypted = crypto.AES.decrypt(
    { ciphertext },
    key,
    {
      iv,
      mode: crypto.mode.GCM,
      format: crypto.format.OpenSSL,
    }
  );

  const jsonStr = decrypted.toString(crypto.enc.Utf8);
  return JSON.parse(jsonStr);
}

/**
 * ✅ Valida el tamaño máximo del backup antes de guardarlo.
 * @param {Object} data - Datos JSON antes de cifrar
 * @param {number} limitBytes - Límite máximo en bytes
 * @returns {boolean}
 */
export function isBackupSizeWithinLimit(data, limitBytes) {
  const jsonStr = JSON.stringify(data);
  const sizeBytes = new Blob([jsonStr]).size;
  return sizeBytes <= limitBytes;
}

/**
 * ✅ Guarda el backup local en localStorage.
 * @param {string} pubkey
 * @param {Object} encryptedData
 */
export function saveBackupLocal(pubkey, encryptedData) {
  localStorage.setItem(`backup_${pubkey}`, JSON.stringify(encryptedData));
}

/**
 * ✅ Carga backup local de localStorage.
 * @param {string} pubkey
 * @returns {Object|null}
 */
export function loadBackupLocal(pubkey) {
  const data = localStorage.getItem(`backup_${pubkey}`);
  return data ? JSON.parse(data) : null;
}

/**
 * ✅ Borra backup local.
 * @param {string} pubkey
 */
export function deleteBackupLocal(pubkey) {
  localStorage.removeItem(`backup_${pubkey}`);
}

/**
 * ✅ Envía el backup cifrado al backend (Premium).
 * @param {Object} encryptedData
 * @returns {Promise<Object>}
 */
export async function saveBackupToBackend(encryptedData) {
  return apiRequest("/api/backups/save", {
    method: "POST",
    body: JSON.stringify(encryptedData),
  });
}

/**
 * ✅ Descarga backup cifrado del backend (Premium).
 * @returns {Promise<Object>}
 */
export async function loadBackupFromBackend() {
  return apiRequest("/api/backups/latest", {
    method: "GET",
  });
}

/**
 * ✅ Devuelve previews paginadas de las conversaciones.
 * @param {string} pubkey
 * @param {Object} options
 * @param {number} options.offset
 * @param {number} options.limit
 * @returns {Promise<Object[]>}
 */
export async function fetchChatPreviews(pubkey, { offset = 0, limit = 10 } = {}) {
  return apiRequest(
    `/api/backups/previews?pubkey=${pubkey}&offset=${offset}&limit=${limit}`,
    { method: "GET" }
  );
}

/**
 * ✅ Devuelve historial cifrado de un chat completo (Premium o Básico).
 * @param {string} chatId
 * @param {number} offset
 * @param {number} limit
 * @returns {Promise<Object>}
 */
export async function fetchChatHistory(chatId, offset = 0, limit = 200) {
  return apiRequest(
    `/api/backups/chat/${chatId}?offset=${offset}&limit=${limit}`,
    { method: "GET" }
  );
}
