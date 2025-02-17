import { useState, useEffect, useCallback } from "react";
import { getConnectedWallet, ensureWalletState } from "../services/walletService";
import { fetchContacts, sendContactRequest, approveContact, rejectContact } from "../services/contactService";

export default function useContactManager() {
    const [confirmedContacts, setConfirmedContacts] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [receivedRequests, setReceivedRequests] = useState([]);

    // ✅ Actualizar la lista de contactos
    const updateContacts = useCallback(async () => {
        try {
            const contacts = await fetchContacts();
            setConfirmedContacts(contacts.confirmed || []);
            setPendingRequests(contacts.pending || []);
            setReceivedRequests(contacts.requests || []);
        } catch (error) {
            console.error("❌ Error al obtener contactos:", error);
        }
    }, []);

    // ✅ Sincronizar estado de la wallet con contactos
    useEffect(() => {
        const checkWalletAndFetchContacts = async () => {
            const status = await ensureWalletState();
            if (status.walletAddress) {
                await updateContacts();
            }
        };

        checkWalletAndFetchContacts();
        window.addEventListener("walletConnected", checkWalletAndFetchContacts);
        window.addEventListener("walletDisconnected", () => {
            setConfirmedContacts([]);
            setPendingRequests([]);
            setReceivedRequests([]);
        });

        return () => {
            window.removeEventListener("walletConnected", checkWalletAndFetchContacts);
            window.removeEventListener("walletDisconnected", () => {
                setConfirmedContacts([]);
                setPendingRequests([]);
                setReceivedRequests([]);
            });
        };
    }, [updateContacts]);

    // ✅ Enviar solicitud de contacto
    const handleAddContact = async (wallet) => {
        try {
            await sendContactRequest(wallet);
            await updateContacts();
        } catch (error) {
            console.error("❌ Error enviando solicitud de contacto:", error);
        }
    };

    // ✅ Aceptar solicitud de contacto
    const handleAcceptRequest = async (wallet) => {
        try {
            await approveContact(wallet);
            await updateContacts();
        } catch (error) {
            console.error("❌ Error aceptando solicitud de contacto:", error);
        }
    };

    // ✅ Rechazar solicitud de contacto
    const handleRejectRequest = async (wallet) => {
        try {
            await rejectContact(wallet);
            await updateContacts();
        } catch (error) {
            console.error("❌ Error rechazando solicitud de contacto:", error);
        }
    };

    return {
        confirmedContacts,
        pendingRequests,
        receivedRequests,
        handleAddContact,
        handleAcceptRequest,
        handleRejectRequest,
    };
}
