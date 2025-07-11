import { useEffect, useState, useRef, useCallback } from "react";
import {
  deriveEncryptionKey,
  encryptBackupData,
  decryptBackupData,
  saveBackupLocal,
  loadBackupLocal,
  deleteBackupLocal,
  saveBackupToBackend,
  loadBackupFromBackend,
  deleteBackupFromBackend,
  isBackupSizeWithinLimit,
  calculateBackupHash,
  fetchChatPreviews,
  fetchChatHistory,
  saveMultiFileBackup,
  loadMultiFileBackup,
  loadIndexJson,
} from "../services/backupService.js";

import { mergeBackups } from "../services/mergeService.js";
import { signMessageForLogin } from "../services/walletService.js";
import { checkAuthStatus, apiRequest } from "../services/apiService.js";
import { notify } from "../services/notificationService.js";

const MAX_SIZE_BASIC = 10 * 1024 * 1024;
const MAX_SIZE_PREMIUM = 20 * 1024 * 1024;

export default function useBackupManager() {
  const [backupData, setBackupData] = useState(null);
  const [previews, setPreviews] = useState([]);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [backupSizeExceeded, setBackupSizeExceeded] = useState(false);

  const encryptionKeyRef = useRef(null);
  const timerRef = useRef(null);
  const pubkeyRef = useRef(null);

  /**
   * ✅ Deriva la clave y carga backup inicial.
   */
  const initialize = useCallback(async () => {
    setLoading(true);
    try {
      const { isAuthenticated, pubkey, premium } = await checkAuthStatus();

      if (!isAuthenticated || !pubkey) {
        console.warn("⚠️ Usuario no autenticado. No se inicializa backup.");
        setLoading(false);
        return;
      }

      setIsPremium(premium);
      pubkeyRef.current = pubkey;

      const signed = await signMessageForLogin("derive-backup-key");
      const key = deriveEncryptionKey(signed.signature, signed.pubkey);
      encryptionKeyRef.current = key;

      let local = loadBackupLocal(pubkey);
      let localHash = null;
      let localTimestamp = null;

      if (local) {
        localHash = calculateBackupHash(local.encryptedData);
        localTimestamp = local.timestamp;
      }

      let cloudHash = null;
      let cloudLastUpdated = null;

      if (premium) {
        try {
          const res = await apiRequest("/api/backups/cloud/hash", { method: "GET" });
          if (res.success) {
            cloudHash = res.backupHash;
            cloudLastUpdated = new Date(res.lastUpdated).getTime();
          }
        } catch (err) {
          if (err.response?.error === "CLOUD_BACKUP_NOT_FOUND") {
            cloudHash = null;
          } else {
            console.error("❌ Error consultando hash cloud:", err);
            setLoading(false);
            return;
          }
        }
      }

      // Caso 1: No existe cloud → subir local si existe
      if (!cloudHash && local) {
        const decrypted = decryptBackupData(local.encryptedData, key);
        await saveBackupToBackend(local.encryptedData, decrypted);
        setBackupData(decrypted);
        console.log("✅ Backup local subido al cloud.");
        startPeriodicBackup();
        setLoading(false);
        return;
      }

      // Caso 2: No existe local → descargar cloud
      if (cloudHash && !local) {
        const cloudEncrypted = await loadBackupFromBackend();
        const decrypted = decryptBackupData(cloudEncrypted, key);
        saveBackupLocal(pubkey, cloudEncrypted);
        setBackupData(decrypted);
        console.log("✅ Backup cloud descargado.");
        startPeriodicBackup();
        setLoading(false);
        return;
      }

      // Caso 3: Ambos existen
      if (cloudHash && localHash) {
        if (cloudHash === localHash) {
          const decrypted = decryptBackupData(local.encryptedData, key);
          setBackupData(decrypted);
          console.log("✅ Local y cloud idénticos.");
        } else {
          let cloudDecrypted = null;
          let localDecrypted = null;

          if (cloudLastUpdated > localTimestamp) {
            const cloudEncrypted = await loadBackupFromBackend();
            cloudDecrypted = decryptBackupData(cloudEncrypted, key);
            localDecrypted = local
              ? decryptBackupData(local.encryptedData, key)
              : { messages: [], metadata: {} };

            const merged = mergeBackups(localDecrypted, cloudDecrypted);
            const encryptedMerged = encryptBackupData(merged, key);

            saveBackupLocal(pubkey, encryptedMerged);
            await saveBackupToBackend(encryptedMerged, merged);

            setBackupData(merged);
            console.log("✅ Cloud más nuevo → merge realizado y guardado.");
          } else {
            const cloudEncrypted = await loadBackupFromBackend();
            cloudDecrypted = decryptBackupData(cloudEncrypted, key);
            localDecrypted = local
              ? decryptBackupData(local.encryptedData, key)
              : { messages: [], metadata: {} };

            const merged = mergeBackups(cloudDecrypted, localDecrypted);
            const encryptedMerged = encryptBackupData(merged, key);

            saveBackupLocal(pubkey, encryptedMerged);
            await saveBackupToBackend(encryptedMerged, merged);

            setBackupData(merged);
            console.log("✅ Local más nuevo → merge realizado y guardado.");
          }
        }
        startPeriodicBackup();
        setLoading(false);
        return;
      }

      // Caso 4: No hay nada → inicializar vacío
      setBackupData({ messages: [], metadata: {} });
      startPeriodicBackup();
      setLoading(false);

    } catch (error) {
      console.error("❌ Error inicializando backup:", error);
      setLoading(false);
    }
  }, []);

  /**
   * ✅ Guardado periódico en local / backend.
   */
  const startPeriodicBackup = useCallback(() => {
    clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      saveBackup();
    }, isPremium ? 60_000 : 10 * 60_000);
  }, [isPremium]);

  /**
   * ✅ Guarda el backup (local + opcional backend)
   */
  const saveBackup = useCallback(async () => {
    if (!backupData || !encryptionKeyRef.current || !pubkeyRef.current) {
      console.warn("⚠️ No se puede guardar: datos o clave no disponibles.");
      return;
    }

    const sizeLimit = isPremium ? MAX_SIZE_PREMIUM : MAX_SIZE_BASIC;
    if (!isBackupSizeWithinLimit(backupData, sizeLimit)) {
      console.error("❌ Backup supera límite permitido.");
      setBackupSizeExceeded(true);
      return;
    }

    setBackupSizeExceeded(false);

    try {
      const encrypted = encryptBackupData(backupData, encryptionKeyRef.current);
      saveBackupLocal(pubkeyRef.current, encrypted);

      if (isPremium) {
        await saveBackupToBackend(encrypted, backupData);
        console.log("✅ Backup guardado en backend.");
      } else {
        console.log("✅ Backup guardado localmente (Basic).");
      }

    } catch (error) {
      console.error("❌ Error guardando backup:", error);
    }
  }, [backupData, isPremium]);

  /**
   * ✅ Importa múltiples archivos físicos.
   *
   * @param {Array<File>} files
   */
  const importMultiFileBackup = useCallback(async (files) => {
    if (!encryptionKeyRef.current || !pubkeyRef.current) {
      console.error("❌ No hay clave para descifrar el backup.");
      return;
    }

    let indexJson = null;
    const dataFiles = [];

    for (const file of files) {
      if (file.name.startsWith("index_")) {
        const text = await file.text();
        indexJson = JSON.parse(text);
        localStorage.setItem(`index_${pubkeyRef.current}`, JSON.stringify(indexJson));
        console.log("✅ index.json importado.");
      } else {
        dataFiles.push(file);
      }
    }

    if (dataFiles.length > 0) {
      const merged = await loadMultiFileBackup(dataFiles, encryptionKeyRef.current);
      setBackupData(merged);
      notify("Multi-file backup importado correctamente.", "success");
    }
  }, []);

  /**
   * ✅ Borra todos los archivos multi-file locales.
   */
  const deleteAllBackupsLocal = useCallback(() => {
    if (!pubkeyRef.current) return;

    // borrar index
    localStorage.removeItem(`index_${pubkeyRef.current}`);

    // buscar indexJson para borrar archivos
    const indexJson = loadIndexJson(pubkeyRef.current);
    if (indexJson && indexJson.chats) {
      const allFiles = new Set();
      Object.values(indexJson.chats).forEach(files => {
        files.forEach(f => allFiles.add(f.replace(".json", "")));
      });
      for (const fileKey of allFiles) {
        localStorage.removeItem(fileKey);
      }
      console.log("✅ Todos los backups multi-file locales han sido borrados.");
    }
  }, []);

  /**
   * ✅ Permite sobrescribir datos en memoria y dispara save inmediato
   */
  const updateBackupData = useCallback((newData) => {
    setBackupData(newData);
    saveBackup();
  }, [saveBackup]);

  /**
   * ✅ Borra backup completamente (local y backend Premium)
   */
  const clearBackup = useCallback(async () => {
    if (!pubkeyRef.current) return;

    deleteAllBackupsLocal();
    deleteBackupLocal(pubkeyRef.current);

    if (isPremium) {
      try {
        await deleteBackupFromBackend();
        console.log("✅ Backup eliminado en backend.");
      } catch (e) {
        console.warn("⚠️ No se pudo borrar en backend:", e.message);
      }
    }
    setBackupData(null);
  }, [isPremium]);

  /**
   * ✅ Lazy load previews paginadas
   */
  const loadPreviews = useCallback(async (offset = 0, limit = 10) => {
    try {
      const previews = await fetchChatPreviews(pubkeyRef.current, {
        limit,
        offset,
      });
      setPreviews(previews);
      return previews;
    } catch (error) {
      console.error("❌ Error cargando previews:", error);
      return [];
    }
  }, []);

  /**
   * ✅ Lazy load historial de un chat (descifrado automático)
   */
  const loadChat = useCallback(async (chatId, offset = 0, limit = 20) => {
    if (!encryptionKeyRef.current) {
      console.error("❌ No hay clave para descifrar historial.");
      return null;
    }
    try {
      const encrypted = await fetchChatHistory(chatId, offset, limit);
      const decrypted = decryptBackupData(encrypted, encryptionKeyRef.current);
      return decrypted;
    } catch (err) {
      console.error("❌ Error cargando historial:", err);
      return null;
    }
  }, []);

  /**
   * ✅ Inicializar en primer render
   */
  useEffect(() => {
    initialize();
    return () => {
      clearInterval(timerRef.current);
    };
  }, [initialize]);

  return {
    backupData,
    updateBackupData,
    clearBackup,
    loadPreviews,
    previews,
    loadChat,
    loading,
    isPremium,
    backupSizeExceeded,
    saveBackup,
    importMultiFileBackup,
    deleteAllBackupsLocal,
  };
}
