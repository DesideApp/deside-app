/**
 * ✅ Importa backup físico desde archivo JSON.
 *
 * @param {File} file - archivo subido por el user.
 * @returns {Promise<Object>} JSON parseado.
 */
export function importBackupFromFile(file) {
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
