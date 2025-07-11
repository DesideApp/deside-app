import React, { useEffect, useRef } from "react";
import useConversationPreviews from "../../hooks/useConversationPreviews.js";

export default function ConverList({
  pubkey,
  encryptionKey,
  onSelect,
}) {
  const {
    previews,
    loadNextPage,
    hasMore,
    loading,
  } = useConversationPreviews(pubkey, encryptionKey, 10);

  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (
        container.scrollTop + container.clientHeight >=
        container.scrollHeight - 10
      ) {
        if (hasMore && !loading) {
          loadNextPage();
        }
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [hasMore, loading, loadNextPage]);

  useEffect(() => {
    loadNextPage();
  }, [loadNextPage]);

  return (
    <div
      ref={containerRef}
      className="overflow-y-auto h-full p-3 border border-gray-200 rounded"
    >
      {previews.length === 0 && !loading && (
        <div className="text-gray-500">No hay conversaciones aún.</div>
      )}

      {previews.map((chat) => (
        <div
          key={chat.chatId}
          onClick={() => onSelect(chat.chatId)}
          className="p-2 border-b border-gray-100 cursor-pointer hover:bg-gray-50"
        >
          <div className="font-medium text-gray-800">
            {chat.chatId}
          </div>
          <div className="text-gray-600 text-sm truncate">
            {chat.lastMessageText || "Sin mensajes."}
          </div>
          {chat.lastMessageTimestamp && (
            <div className="text-gray-400 text-xs">
              {new Date(chat.lastMessageTimestamp).toLocaleString()}
            </div>
          )}
        </div>
      ))}

      {loading && (
        <div className="text-gray-400 text-center py-2">
          Cargando...
        </div>
      )}

      {!hasMore && previews.length > 0 && (
        <div className="text-gray-400 text-center py-2">
          No hay más conversaciones.
        </div>
      )}
    </div>
  );
}
