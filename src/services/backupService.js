import crypto from "crypto-js";
import { apiRequest } from "./apiService.js";
import { mergeBackups } from "./mergeService.js";

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

  const ciphertextHex = encrypted.ciphertext.toString(crypto.enc.Hex);

  const authTag = null;

  const hash = crypto.SHA256(ciphertextHex).toString();

  return {
    iv: iv.toString(crypto.enc.Hex),
    encrypted: ciphertextHex,
    authTag,
    hash,
  };
}

/**
 * ✅ Descifra un objeto JSON cifrado.
 * @param {Object} encryptedData - { iv, encrypted, authTag, hash }
 * @param {crypto.lib.WordArray} key - Clave derivada
 * @returns {Object} JSON descifrado
 */
export function decryptBackupData(encryptedData, key) {
  const iv = crypto.enc.Hex.parse(encryptedData.iv);
  const ciphertext = crypto.enc.Hex.parse(encryptedData.encrypted);

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
  localStorage.setItem(`backup_ts_${pubkey}`, Date.now().toString());
}

/**
 * ✅ Guarda el Index del backup local en localStorage.
 * @param {string} pubkey
 * @param {Object} indexJson
 */
export function saveIndexJson(pubkey, indexJson) {
  localStorage.setItem(`index_${pubkey}`, JSON.stringify(indexJson));
}

/**
 * ✅ Carga backup local de localStorage.
 * @param {string} pubkey
 * @returns {Object|null}
 */
export function loadBackupLocal(pubkey) {
  const dataStr = localStorage.getItem(`backup_${pubkey}`);
  const tsStr = localStorage.getItem(`backup_ts_${pubkey}`);

  if (!dataStr) return null;

  return {
    encryptedData: JSON.parse(dataStr),
    timestamp: tsStr ? parseInt(tsStr, 10) : null,
  };
}

/**
 * ✅ Carga el Index del backup local desde localStorage.
 * @param {string} pubkey
 * @returns {Object|null} Index JSON o null si no existe
 */
export function loadIndexJson(pubkey) {
  const str = localStorage.getItem(`index_${pubkey}`);
  return str ? JSON.parse(str) : null;
}

/**
 * ✅ Borra backup local.
 * @param {string} pubkey
 */
export function deleteBackupLocal(pubkey) {
  localStorage.removeItem(`backup_${pubkey}`);
  localStorage.removeItem(`backup_ts_${pubkey}`);
  localStorage.removeItem(`index_${pubkey}`);
}

/**
 * ✅ Envía el backup cifrado al backend (Premium).
 * @param {Object} encryptedData
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function saveBackupToBackend(encryptedData, data) {
  return apiRequest("/api/backups/save", {
    method: "POST",
    body: JSON.stringify({
      encryptedData,
      data,
    }),
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
 * ✅ Elimina el backup cifrado del backend (Premium).
 * @returns {Promise<Object>}
 */
export async function deleteBackupFromBackend() {
  return apiRequest("/api/backups/cloud", {
    method: "DELETE",
  });
}

/** 
 * ✅ Calcula el hash SHA-256 del backup cifrado.
 * @param {Object} encryptedData
 * @returns {string} Hash en formato hexadecimal
 */
export function calculateBackupHash(encryptedData) {
  const jsonStr = JSON.stringify(encryptedData);
  return crypto.SHA256(jsonStr).toString();
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

/**
 * ✅ Carga un archivo de backup local desde LocalStorage.
 * @param {string} pubkey
 * @param {string} fileName
 * @returns {Object|null}
 */
export function loadBackupFileLocal(pubkey, fileName) {
  const key = fileName.replace(".json", "");
  const str = localStorage.getItem(key);
  return str ? JSON.parse(str) : null;
}

/**
 * ✅ Carga un archivo de backup local desde disco físico.
 * @param {File} file
 * @returns {Promise<Object>} JSON parseado
 */
export function loadBackupFileFromDisk(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result);
        resolve(json);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

/**
 * ✅ Guarda múltiples archivos de backup cifrado en disco o LocalStorage.
 *
 * @param {Array<{ fileName: string, data: Object }>} parts - Array de backups divididos
 * @param {crypto.lib.WordArray} encryptionKey - Clave AES derivada
 * @param {string} pubkey - Clave pública del usuario
 * @param {boolean} toDisk - true → descarga archivos físicos. false → localStorage
 */
export function saveMultiFileBackup(parts, encryptionKey, pubkey, toDisk = true) {
  const indexJson = { chats: {} };

  for (const part of parts) {
    // cifrar cada parte
    const encrypted = encryptBackupData(part.data, encryptionKey);

    if (toDisk) {
      // generar descarga de archivo físico
      const blob = new Blob([JSON.stringify(encrypted, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = part.fileName;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // guardarlo en localStorage
      localStorage.setItem(part.fileName.replace(".json", ""), JSON.stringify(encrypted));
    }

    // indexar chats en indexJson
    for (const msg of part.data.messages) {
      if (!indexJson.chats[msg.chatId]) {
        indexJson.chats[msg.chatId] = [];
      }
      if (!indexJson.chats[msg.chatId].includes(part.fileName)) {
        indexJson.chats[msg.chatId].push(part.fileName);
      }
    }
  }

  // Guardar indexJson
  if (toDisk) {
    const blob = new Blob([JSON.stringify(indexJson, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `index_${pubkey}.json`;
    a.click();
    URL.revokeObjectURL(url);
  } else {
    localStorage.setItem(`index_${pubkey}`, JSON.stringify(indexJson));
  }
}

/**
 * ✅ Carga múltiples archivos físicos subidos por el user,
 * mergea todo y devuelve el backup final descifrado.
 *
 * @param {Array<File>} files - archivos .json subidos
 * @param {crypto.lib.WordArray} encryptionKey
 * @returns {Promise<Object>} backupData fusionado
 */
export async function loadMultiFileBackup(files, encryptionKey) {
  const backups = [];

  for (const file of files) {
    const json = await loadBackupFileFromDisk(file);
    const decrypted = decryptBackupData(json, encryptionKey);
    backups.push(decrypted);
  }

  let merged = backups[0] || { messages: [], metadata: {} };

  for (let i = 1; i < backups.length; i++) {
    merged = mergeBackups(merged, backups[i]);
  }

  return merged;
}