import { useState, useEffect, useCallback } from "react";
import { fetchChatPreviews } from "../services/backupService";
import { getPublicKey } from "../services/walletService";

export default function useConversationManager() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const pubkey = getPublicKey();
      if (!pubkey) {
        console.warn("⚠️ No pubkey available for fetching conversations.");
        setConversations([]);
        setLoading(false);
        return;
      }

      const previews = await fetchChatPreviews(pubkey, {
        limit: 50,   // o el número que prefieras
        offset: 0
      });

      setConversations(previews || []);
    } catch (err) {
      console.error("❌ Error loading conversations:", err);
      setError(err.message || "Unknown error");
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Cargar automáticamente al montar el hook
  useEffect(() => {
    fetchConversations();

    const handleWalletDisconnect = () => {
      console.warn("🔴 Wallet disconnected → clearing conversations.");
      setConversations([]);
    };

    window.addEventListener("walletDisconnected", handleWalletDisconnect);

    return () => {
      window.removeEventListener("walletDisconnected", handleWalletDisconnect);
    };
  }, [fetchConversations]);

  return {
    conversations,
    loading,
    error,
    refreshConversations: fetchConversations,
  };
}
