// /hooks/useAddContactManager.js

import { useState, useEffect, useCallback, useRef } from "react";
import { checkAuthStatus } from "../services/apiService.js";
import { sendContactRequest, fetchContacts } from "../services/contactService.js";
import { searchUserByPubkey } from "../services/userService.js";
import { notify } from "../services/notificationService.js";

export default function useAddContactManager(onContactAdded) {
  const [pubkey, setPubkey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sentRequests, setSentRequests] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef(null);

  const isValidPubkey = /^([1-9A-HJ-NP-Za-km-z]{32,44})$/.test(pubkey.trim());

  // ✅ Autosize textarea
  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = "50px";
      if (textarea.scrollHeight > textarea.clientHeight) {
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }
  }, [pubkey]);

  // ✅ Fetch sent requests on mount
  useEffect(() => {
    let isMounted = true;

    const fetchSent = async () => {
      try {
        const contacts = await fetchContacts();
        if (isMounted) {
          setSentRequests(contacts.outgoing || []);
        }
      } catch (error) {
        console.error("❌ Error fetching sent requests:", error);
      }
    };

    fetchSent();

    return () => {
      isMounted = false;
    };
  }, []);

  const clearInput = () => setPubkey("");

  const handleAddContact = useCallback(async () => {
    const trimmedPubkey = pubkey.trim();

    if (!isValidPubkey) {
      notify("❌ Invalid public key.", "error");
      return;
    }

    setIsLoading(true);

    try {
      const { isAuthenticated } = await checkAuthStatus();
      if (!isAuthenticated) {
        notify("⚠️ You must be logged in to add contacts.", "error");
        return;
      }

      const result = await searchUserByPubkey(trimmedPubkey);

      if (result.error) {
        notify(result.message, "error");
        return;
      }

      if (!result.registered) {
        notify("⚠️ This wallet is not registered on Deside.", "error");
        return;
      }

      if (result.relationship === "confirmed") {
        notify("⚠️ This user is already your contact.", "info");
        return;
      }

      if (result.relationship === "pending") {
        notify("⚠️ You already have a pending request with this user.", "info");
        return;
      }

      if (result.blocked) {
        notify("⚠️ This user is blocked.", "error");
        return;
      }

      if (result.nickname) {
        notify(`✅ User found: ${result.nickname}`, "success");
      } else {
        notify("✅ User found.", "success");
      }

      await sendContactRequest(trimmedPubkey);
      notify("✅ Request sent successfully.", "success");
      setPubkey("");

      if (onContactAdded) {
        onContactAdded();
      }

      const contacts = await fetchContacts();
      setSentRequests(contacts.outgoing || []);
    } catch (error) {
      console.error("❌ Error sending request:", error);
      notify("❌ Error sending request.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [pubkey, isValidPubkey, onContactAdded]);

  return {
    pubkey,
    setPubkey,
    isValidPubkey,
    isLoading,
    textareaRef,
    handleAddContact,
    sentRequests,
    isExpanded,
    setIsExpanded,
    clearInput,
  };
}
