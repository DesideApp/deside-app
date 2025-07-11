import crypto from "crypto-js";

/**
 * ✅ Genera hash único de un mensaje si no tiene id.
 * @param {Object} msg
 * @returns {string}
 */
function generateMessageSignature(msg) {
  return crypto.SHA256(
    msg.chatId + msg.text + msg.timestamp
  ).toString();
}

/**
 * ✅ Mergea dos backups descifrados.
 *
 * @param {Object} backupA
 * @param {Object} backupB
 * @returns {Object} backup fusionado
 */
export function mergeBackups(backupA, backupB) {
  const mergedBackup = {
    messages: [],
    metadata: {
      recentConversations: [],
      indexData: {},
      ...backupA.metadata,
    },
  };

  const seen = new Set();

  // 1. Merge messages
  const allMessages = [
    ...(backupA.messages || []),
    ...(backupB.messages || []),
  ];

  for (const msg of allMessages) {
    let uniqueId = msg.id;
    if (!uniqueId) {
      uniqueId = generateMessageSignature(msg);
    }

    if (!seen.has(uniqueId)) {
      mergedBackup.messages.push(msg);
      seen.add(uniqueId);
    }
  }

  // Ordenar mensajes por timestamp ASC
  mergedBackup.messages.sort((a, b) => {
    const timeA = new Date(a.timestamp || 0).getTime();
    const timeB = new Date(b.timestamp || 0).getTime();
    return timeA - timeB;
  });

  // 2. Merge recentConversations
  const recentMap = {};

  for (const conv of [
    ...(backupA.metadata?.recentConversations || []),
    ...(backupB.metadata?.recentConversations || []),
  ]) {
    const key = conv.chatId;
    if (!recentMap[key]) {
      recentMap[key] = conv;
    } else {
      const prevTime = new Date(recentMap[key].lastMessageTimestamp || 0).getTime();
      const newTime = new Date(conv.lastMessageTimestamp || 0).getTime();
      if (newTime > prevTime) {
        recentMap[key] = conv;
      }
    }
  }

  mergedBackup.metadata.recentConversations = Object.values(recentMap);

  // 3. Merge indexData (deep merge)
  mergedBackup.metadata.indexData = deepMergeIndexData(
    backupA.metadata?.indexData || {},
    backupB.metadata?.indexData || {}
  );

  // 4. Merge extra flags (e.g. premiumBackup, pendingDeletion)
  mergedBackup.metadata.premiumBackup =
    (backupA.metadata?.premiumBackup || false) ||
    (backupB.metadata?.premiumBackup || false);

  mergedBackup.metadata.pendingDeletion =
    (backupA.metadata?.pendingDeletion || false) ||
    (backupB.metadata?.pendingDeletion || false);

  mergedBackup.metadata.deletionTimestamp =
    latestDate(
      backupA.metadata?.deletionTimestamp,
      backupB.metadata?.deletionTimestamp
    );

  return mergedBackup;
}

/**
 * ✅ Devuelve la fecha más reciente entre dos valores Date o null.
 */
function latestDate(dateA, dateB) {
  const timeA = dateA ? new Date(dateA).getTime() : 0;
  const timeB = dateB ? new Date(dateB).getTime() : 0;
  return timeA >= timeB ? dateA : dateB;
}

/**
 * ✅ Deep merge de indexData.
 *
 * Une arrays de archivos por chatId.
 */
function deepMergeIndexData(a, b) {
  const result = { ...a };

  for (const [chatId, files] of Object.entries(b)) {
    if (!result[chatId]) {
      result[chatId] = [...files];
    } else {
      const mergedSet = new Set([...result[chatId], ...files]);
      result[chatId] = Array.from(mergedSet);
    }
  }

  return result;
}
