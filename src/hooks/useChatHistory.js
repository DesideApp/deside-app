import { useState, useCallback } from "react";
import { decryptBackupData } from "../services/backupService.js";

/**
 * ✅ Hook multi-file aware para lazy load de mensajes dentro de un chat.
 *
 * @param {string} chatId
 * @param {crypto.lib.WordArray} encryptionKey
 * @param {Object} indexJson
 * @param {Function} loadBackupFile
 * @returns {Object}
 */
export default function useChatHistory(chatId, encryptionKey, indexJson, loadBackupFile) {
  const [messages, setMessages] = useState([]);
  const [loadedFiles, setLoadedFiles] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const loadNextFile = useCallback(async () => {
    if (!hasMore) return;

    const files = indexJson?.chats?.[chatId];
    if (!files || files.length === 0) {
      console.log(`ℹ️ No hay archivos para el chat ${chatId}.`);
      setHasMore(false);
      return;
    }

    const nextFile = files.find((file) => !loadedFiles.includes(file));

    if (!nextFile) {
      console.log(`ℹ️ No quedan más archivos para el chat ${chatId}.`);
      setHasMore(false);
      return;
    }

    try {
      const encryptedData = await loadBackupFile(nextFile);

      if (!encryptedData) {
        console.warn(`⚠️ No se pudo cargar el archivo ${nextFile}`);
        setHasMore(false);
        return;
      }

      const decrypted = decryptBackupData(encryptedData, encryptionKey);

      const filtered = decrypted?.messages?.filter(
        (msg) => msg.chatId === chatId
      ) || [];

      setMessages((prev) => [...filtered, ...prev]);
      setLoadedFiles((prev) => [...prev, nextFile]);

      console.log(`✅ Cargado archivo ${nextFile} para el chat ${chatId}.`);

      if (files.length === loadedFiles.length + 1) {
        setHasMore(false);
      }
    } catch (e) {
      console.error("❌ Error cargando archivo:", e);
      setHasMore(false);
    }
  }, [chatId, encryptionKey, indexJson, loadedFiles, hasMore, loadBackupFile]);

  return {
    messages,
    loadNextFile,
    hasMore,
  };
}
