import { useState, useEffect, useCallback } from "react";
import { fetchContacts, sendContactRequest, approveContact, rejectContact } from "../services/contactService";
import { checkAuthStatus } from "../services/apiService.js"; // ✅ Validación de autenticación

export default function useContactManager() {
    const [confirmedContacts, setConfirmedContacts] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [receivedRequests, setReceivedRequests] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // ✅ **Actualizar estado de contactos**
    const updateContactsState = async () => {
        try {
            const contacts = await fetchContacts();
            setConfirmedContacts(contacts.confirmed || []);
            setPendingRequests(contacts.pending || []);
            setReceivedRequests(contacts.requests || []);
        } catch (error) {
            console.error("❌ Error al actualizar contactos:", error);
        }
    };

    // ✅ **Verificar autenticación y cargar contactos**
    useEffect(() => {
        let isMounted = true;

        const verifyAuthAndFetchContacts = async () => {
            try {
                const status = await checkAuthStatus();
                if (isMounted) {
                    setIsAuthenticated(status.isAuthenticated);
                    if (status.isAuthenticated) await updateContactsState();
                }
            } catch (error) {
                console.error("❌ Error verificando autenticación:", error);
            }
        };

        verifyAuthAndFetchContacts();

        const handleWalletConnected = () => {
            console.log("🔵 Wallet conectada. Verificando autenticación...");
            verifyAuthAndFetchContacts();
        };

        const handleWalletDisconnected = () => {
            console.warn("🔴 Wallet desconectada. Reseteando contactos...");
            setConfirmedContacts([]);
            setPendingRequests([]);
            setReceivedRequests([]);
            setIsAuthenticated(false);
        };

        window.addEventListener("walletConnected", handleWalletConnected);
        window.addEventListener("walletDisconnected", handleWalletDisconnected);

        return () => {
            isMounted = false;
            window.removeEventListener("walletConnected", handleWalletConnected);
            window.removeEventListener("walletDisconnected", handleWalletDisconnected);
        };
    }, []);

    // ✅ **Funciones de gestión de contactos**
    const handleAddContact = useCallback(async (wallet) => {
        if (!isAuthenticated) return alert("⚠️ Debes estar autenticado para agregar contactos.");
        try {
            await sendContactRequest(wallet);
            await updateContactsState();
        } catch (error) {
            console.error("❌ Error enviando solicitud de contacto:", error);
        }
    }, [isAuthenticated]);

    const handleAcceptRequest = useCallback(async (wallet) => {
        if (!isAuthenticated) return alert("⚠️ Debes estar autenticado para aceptar contactos.");
        try {
            await approveContact(wallet);
            await updateContactsState();
        } catch (error) {
            console.error("❌ Error aceptando solicitud de contacto:", error);
        }
    }, [isAuthenticated]);

    const handleRejectRequest = useCallback(async (wallet) => {
        if (!isAuthenticated) return alert("⚠️ Debes estar autenticado para rechazar contactos.");
        try {
            await rejectContact(wallet);
            await updateContactsState();
        } catch (error) {
            console.error("❌ Error rechazando solicitud de contacto:", error);
        }
    }, [isAuthenticated]);

    return {
        confirmedContacts,
        pendingRequests,
        receivedRequests,
        handleAddContact,
        handleAcceptRequest,
        handleRejectRequest,
    };
}
