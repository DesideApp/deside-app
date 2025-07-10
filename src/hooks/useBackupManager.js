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
  isBackupSizeWithinLimit,
  fetchChatPreviews,
  fetchChatHistory
} from "../services/backupService.js";

import { signMessageForLogin } from "../services/walletService.js";
import { checkAuthStatus } from "../services/apiService.js";

const MAX_SIZE_BASIC = 10 * 1024 * 1024;      // 10 MB
const MAX_SIZE_PREMIUM = 20 * 1024 * 1024;    // 20 MB

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

      let encryptedBackup = null;
      if (premium) {
        try {
          encryptedBackup = await loadBackupFromBackend();
        } catch (e) {
          console.warn("⚠️ No se pudo cargar backup del backend. Intentando local...");
        }
      }

      if (!encryptedBackup) {
        encryptedBackup = loadBackupLocal(pubkey);
      }

      if (encryptedBackup) {
        const decrypted = decryptBackupData(encryptedBackup, key);
        setBackupData(decrypted);
        console.log("✅ Backup restaurado correctamente.");
      } else {
        console.log("ℹ️ No backup found. Arrancando en blanco.");
        setBackupData({ messages: [], metadata: {} });
      }

      startPeriodicBackup();

    } catch (error) {
      console.error("❌ Error inicializando backup:", error);
    } finally {
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
        await saveBackupToBackend(encrypted);
        console.log("✅ Backup guardado en backend.");
      } else {
        console.log("✅ Backup guardado localmente (Basic).");
      }

    } catch (error) {
      console.error("❌ Error guardando backup:", error);
    }
  }, [backupData, isPremium]);

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

    deleteBackupLocal(pubkeyRef.current);
    if (isPremium) {
      try {
        await saveBackupToBackend({ delete: true });
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
        offset
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
  };
}
