import React, { useRef } from "react";

export default function BackupButtons({
  onSave,
  onDownload,
  onImport,
  onDownloadMulti,
  onImportMulti,
  isDisabled,
}) {
  const fileInputRef = useRef(null);
  const multiFileInputRef = useRef(null);

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImportMultiClick = () => {
    if (multiFileInputRef.current) {
      multiFileInputRef.current.click();
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      <button
        className="bg-green-600 text-white px-3 py-1 rounded"
        onClick={onSave}
        disabled={isDisabled}
      >
        Guardar ahora
      </button>
      <button
        className="bg-blue-600 text-white px-3 py-1 rounded"
        onClick={onDownload}
        disabled={isDisabled}
      >
        Descargar JSON
      </button>
      <button
        className="bg-yellow-500 text-white px-3 py-1 rounded"
        onClick={handleImportClick}
        disabled={isDisabled}
      >
        Importar JSON
      </button>

      <button
        className="bg-purple-600 text-white px-3 py-1 rounded"
        onClick={onDownloadMulti}
        disabled={isDisabled}
      >
        Descargar Multi-File
      </button>
      <button
        className="bg-pink-600 text-white px-3 py-1 rounded"
        onClick={handleImportMultiClick}
        disabled={isDisabled}
      >
        Importar Multi-File
      </button>

      {/* Input file oculto → single file */}
      <input
        type="file"
        accept="application/json"
        ref={fileInputRef}
        className="hidden"
        onChange={onImport}
      />

      {/* Input file oculto → multi-file */}
      <input
        type="file"
        accept="application/json"
        ref={multiFileInputRef}
        className="hidden"
        onChange={onImportMulti}
        multiple
      />
    </div>
  );
}
