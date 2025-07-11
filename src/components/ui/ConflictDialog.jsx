import React from "react";

export default function ConflictDialog({
  isOpen,
  onClose,
  onKeepLocal,
  onDownloadCloud,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          Conflicto de Backup
        </h2>
        <p className="text-gray-700 mb-6">
          Tu backup local es diferente al backup cloud. ¿Qué quieres hacer?
        </p>
        <div className="flex justify-end gap-2">
          <button
            className="bg-gray-300 text-gray-800 px-3 py-1 rounded"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="bg-blue-600 text-white px-3 py-1 rounded"
            onClick={onDownloadCloud}
          >
            Descargar Cloud
          </button>
          <button
            className="bg-green-600 text-white px-3 py-1 rounded"
            onClick={onKeepLocal}
          >
            Mantener Local
          </button>
        </div>
      </div>
    </div>
  );
}
