/**
 * ✅ Devuelve tamaño en bytes de un objeto JSON.
 * @param {Object} obj
 * @returns {number}
 */
function getJsonSize(obj) {
  return new Blob([JSON.stringify(obj)]).size;
}

/**
 * ✅ Split backupData en múltiples archivos de ≤ maxSizeBytes.
 *
 * @param {Object} backupData - backup descifrado completo
 * @param {number} maxSizeBytes - tamaño máximo de cada archivo (ej. 15.5 * 1024 * 1024)
 * @param {string} pubkey - para generar nombres únicos de archivo
 * @returns {Array<{ fileName: string, data: Object }>}
 */
export function splitBackupData(backupData, maxSizeBytes, pubkey = "") {
  if (!backupData || !backupData.messages) {
    return [];
  }

  const parts = [];
  let currentPart = {
    messages: [],
    metadata: {
      recentConversations: [],
      premiumBackup: backupData.metadata?.premiumBackup || false,
      pendingDeletion: backupData.metadata?.pendingDeletion || false,
      deletionTimestamp: backupData.metadata?.deletionTimestamp || null,
      indexData: {},
    },
  };

  const chatsMap = {};

  for (const msg of backupData.messages) {
    if (!chatsMap[msg.chatId]) {
      chatsMap[msg.chatId] = [];
    }
    chatsMap[msg.chatId].push(msg);
  }

  const sortedChatIds = Object.keys(chatsMap).sort();

  let partNumber = 1;

  for (const chatId of sortedChatIds) {
    const chatMessages = chatsMap[chatId];

    const tempPart = {
      ...currentPart,
      messages: [...currentPart.messages, ...chatMessages],
    };

    const sizeWithChat = getJsonSize(tempPart);

    if (sizeWithChat > maxSizeBytes && currentPart.messages.length > 0) {
      // guardar el archivo actual
      finalizePart(currentPart, parts, partNumber, pubkey);
      partNumber += 1;

      // empezar archivo nuevo
      currentPart = {
        messages: [...chatMessages],
        metadata: {
          recentConversations: [],
          premiumBackup: backupData.metadata?.premiumBackup || false,
          pendingDeletion: backupData.metadata?.pendingDeletion || false,
          deletionTimestamp: backupData.metadata?.deletionTimestamp || null,
          indexData: {},
        },
      };
    } else {
      currentPart.messages.push(...chatMessages);
    }

    // actualizar indexData
    if (!currentPart.metadata.indexData[chatId]) {
      currentPart.metadata.indexData[chatId] = [];
    }
    currentPart.metadata.indexData[chatId].push(
      `backup_part${partNumber}_${pubkey}.json`
    );

    // actualizar recentConversations
    const convPreview = (backupData.metadata?.recentConversations || []).find(
      (c) => c.chatId === chatId
    );
    if (convPreview) {
      currentPart.metadata.recentConversations.push(convPreview);
    }
  }

  if (currentPart.messages.length > 0) {
    finalizePart(currentPart, parts, partNumber, pubkey);
  }

  return parts;
}

/**
 * ✅ Guarda un fragmento de backup en la lista de parts.
 */
function finalizePart(part, parts, partNumber, pubkey) {
  parts.push({
    fileName: `backup_part${partNumber}_${pubkey}.json`,
    data: part,
  });
}
