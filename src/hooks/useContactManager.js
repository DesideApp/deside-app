import { useState, useEffect } from "react";
import { getConnectedWallet } from "../services/walletService";
import { fetchWithAuth } from "../services/authServices";

export default function useContactManager() {
    const [confirmedContacts, setConfirmedContacts] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [receivedRequests, setReceivedRequests] = useState([]);

    useEffect(() => {
        const checkWalletAndFetchContacts = async () => {
            const connectedWallet = await getConnectedWallet();
            if (connectedWallet?.walletAddress) {
                await fetchContacts();
            }
        };

        checkWalletAndFetchContacts();
        window.addEventListener("walletConnected", checkWalletAndFetchContacts);

        return () => window.removeEventListener("walletConnected", checkWalletAndFetchContacts);
    }, []);

    // 📌 Obtener contactos
    const fetchContacts = async () => {
        try {
            const response = await fetchWithAuth("/api/contacts");
            const data = await response.json();

            setConfirmedContacts(data.confirmed || []);
            setPendingRequests(data.pending || []);
            setReceivedRequests(data.requests || []);
        } catch (error) {
            console.error("Error fetching contacts:", error);
        }
    };

    // 📌 Enviar solicitud de contacto
    const handleAddContact = async (wallet) => {
        try {
            await fetchWithAuth("/api/contacts/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pubkey: wallet }),
            });

            fetchContacts();
        } catch (error) {
            console.error("Error sending contact request:", error);
        }
    };

    // 📌 Aceptar solicitud de contacto
    const handleAcceptRequest = async (wallet) => {
        try {
            await fetchWithAuth("/api/contacts/accept", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pubkey: wallet }),
            });

            fetchContacts();
        } catch (error) {
            console.error("Error accepting contact request:", error);
        }
    };

    // 📌 Rechazar solicitud de contacto
    const handleRejectRequest = async (wallet) => {
        try {
            await fetchWithAuth("/api/contacts/reject", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pubkey: wallet }),
            });

            fetchContacts();
        } catch (error) {
            console.error("Error rejecting contact request:", error);
        }
    };

    // 📌 Eliminar contacto
    const handleRemoveContact = async (wallet) => {
        try {
            await fetchWithAuth("/api/contacts/remove", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pubkey: wallet }),
            });

            fetchContacts();
        } catch (error) {
            console.error("Error removing contact:", error);
        }
    };

    return {
        confirmedContacts,
        pendingRequests,
        receivedRequests,
        handleAddContact,
        handleAcceptRequest,
        handleRejectRequest,
        handleRemoveContact, // ✅ Nuevo
    };
}
