import { useState, useCallback } from "react";
import {
  loadIndexJson,
  loadBackupFileLocal,
  decryptBackupData
} from "../services/backupService.js";

/**
 * ✅ Hook multi-file aware para cargar conversation previews.
 *
 * @param {string} pubkey
 * @param {crypto.lib.WordArray} encryptionKey
 * @param {number} limit
 * @returns {object}
 */
export default function useConversationPreviews(pubkey, encryptionKey, limit = 10) {
  const [previews, setPreviews] = useState([]);
  const [loadedFiles, setLoadedFiles] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadNextPage = useCallback(async () => {
    if (!hasMore || loading) return;
    setLoading(true);

    try {
      const indexJson = loadIndexJson(pubkey);

      if (!indexJson || !indexJson.chats) {
        console.warn("⚠️ No se encontró index.json.");
        setHasMore(false);
        setLoading(false);
        return;
      }

      // recopilar todos los archivos únicos
      const uniqueFiles = new Set();
      Object.values(indexJson.chats).forEach((filesArray) => {
        filesArray.forEach((f) => uniqueFiles.add(f));
      });

      const allFiles = Array.from(uniqueFiles);

      // Cargar archivos que aún no hemos cargado
      const filesToLoad = allFiles.filter((f) => !loadedFiles.includes(f));

      if (filesToLoad.length === 0) {
        setHasMore(false);
        setLoading(false);
        return;
      }

      const newPreviews = [];

      for (const fileName of filesToLoad.slice(0, limit)) {
        const encrypted = loadBackupFileLocal(pubkey, fileName);

        if (encrypted && encryptionKey) {
          const decrypted = decryptBackupData(encrypted, encryptionKey);

          const conversations = decrypted?.metadata?.recentConversations || [];

          newPreviews.push(...conversations);
        }
      }

      setLoadedFiles((prev) => [...prev, ...filesToLoad.slice(0, limit)]);
      setPreviews((prev) => [...prev, ...newPreviews]);

      if (filesToLoad.length <= limit) {
        setHasMore(false);
      }
    } catch (err) {
      console.error("❌ Error leyendo conversation previews multi-file:", err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [pubkey, encryptionKey, limit, loadedFiles, hasMore, loading]);

  return {
    previews,
    loadNextPage,
    hasMore,
    loading,
  };
}
