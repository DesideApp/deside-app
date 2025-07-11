import React, { useEffect, useRef, useState } from "react";
import useChatHistory from "../../hooks/useChatHistory.js";
import BackupButtons from "../backup/BackupButtons.jsx";
import PremiumCountdown from "../backup/PremiumCountdown.jsx";
import {
  loadBackupFileLocal,
  saveBackupLocal,
  decryptBackupData,
} from "../../services/backupService.js";
import { exportBackupToFile } from "../../services/exportBackup.js";
import { importBackupFromFile } from "../../services/importBackup.js";
import { notify } from "../../services/notificationService.js";

export default function ConversationWindow({
  chatId,
  encryptionKey,
  indexJson,
  pubkey,
  pendingDeletion,
  deletionTimestamp,
  saveBackup,
  importMultiFileBackup,
  deleteAllBackupsLocal,
}) {
  const [loading, setLoading] = useState(false);

  const {
    messages,
    loadNextFile,
    hasMore,
  } = useChatHistory(
    chatId,
    encryptionKey,
    indexJson,
    (fileName) => loadBackupFileLocal(pubkey, fileName)
  );

  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (container.scrollTop === 0 && hasMore) {
        loadNextFile();
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [hasMore, loadNextFile]);

  /**
   * ✅ Guardar backup manualmente
   */
  const handleSave = () => {
    if (typeof saveBackup === "function") {
      saveBackup();
      notify("Backup guardado manualmente.", "success");
    } else {
      notify("Función saveBackup() no disponible.", "error");
    }
  };

  /**
   * ✅ Descargar backup single-file (Export)
   */
  const handleDownloadSingle = () => {
    try {
      const local = loadBackupFileLocal(pubkey, `backup_${new Date().toISOString().slice(0, 10)}.json`);
      if (!local) {
        notify("No se encontró backup local para exportar.", "info");
        return;
      }

      exportBackupToFile(local);
      notify("Backup exportado correctamente.", "success");
    } catch (e) {
      console.error(e);
      notify("Error exportando backup.", "error");
    }
  };

  /**
   * ✅ Importar backup single-file (Import)
   */
  const handleImportSingle = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      const encryptedData = await importBackupFromFile(file);
      notify("Backup importado correctamente.", "success");

      saveBackupLocal(pubkey, encryptedData);

      const decrypted = decryptBackupData(encryptedData, encryptionKey);
      notify("Backup cargado en memoria.", "info");

      // Aquí podrías:
      // setBackupData(decrypted);
    } catch (err) {
      console.error(err);
      notify("Error importando backup.", "error");
    } finally {
      setLoading(false);
    }
  };

  /**
   * ✅ Descargar multi-file backup
   */
  const handleDownloadMulti = () => {
    try {
      setLoading(true);
      if (typeof saveBackup === "function") {
        saveBackup();
        notify("Backup multi-file generado y descargado.", "success");
      } else {
        notify("Función saveBackup() no disponible.", "error");
      }
    } catch (err) {
      console.error(err);
      notify("Error exportando multi-file backup.", "error");
    } finally {
      setLoading(false);
    }
  };

  /**
   * ✅ Importar multi-file backup
   */
  const handleImportMulti = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      setLoading(true);
      notify("Importando multi-file backup...", "info");

      if (typeof importMultiFileBackup === "function") {
        await importMultiFileBackup(files);
        notify("Multi-file backup importado correctamente.", "success");
      } else {
        notify("Función importMultiFileBackup() no disponible.", "error");
      }
    } catch (err) {
      console.error(err);
      notify("Error importando multi-file backup.", "error");
    } finally {
      setLoading(false);
    }
  };

  /**
   * ✅ Limpiar backups multi-file locales
   */
  const handleCleanup = () => {
    if (typeof deleteAllBackupsLocal === "function") {
      deleteAllBackupsLocal();
      notify("Backups multi-file eliminados.", "success");
    } else {
      notify("deleteAllBackupsLocal() no disponible.", "error");
    }
  };

  return (
    <div className="flex flex-col h-full p-4">
      {pendingDeletion && (
        <PremiumCountdown deletionTimestamp={deletionTimestamp} />
      )}

      <BackupButtons
        onSave={handleSave}
        onDownload={handleDownloadSingle}
        onImport={handleImportSingle}
        onDownloadMulti={handleDownloadMulti}
        onImportMulti={handleImportMulti}
        isDisabled={loading}
      />

      <button
        onClick={handleCleanup}
        className="bg-red-600 text-white px-3 py-1 rounded mt-4"
      >
        Limpiar Multi-File Backups
      </button>

      {loading && (
        <div className="text-blue-600 text-center mt-4">
          Procesando...
        </div>
      )}

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto mt-4 border border-gray-300 rounded p-2"
      >
        {messages.length === 0 ? (
          <div className="text-gray-500">No hay mensajes aún.</div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id || `${msg.timestamp}-${msg.text}`}
              className="mb-2"
            >
              <span className="text-gray-700">{msg.text}</span>
              <span className="text-xs text-gray-400 ml-2">
                {new Date(msg.timestamp).toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
