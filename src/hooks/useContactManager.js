import { useState, useEffect, useCallback } from "react";
import { fetchContacts, sendContactRequest, approveContact, rejectContact } from "../services/contactService";
import { checkAuthStatus } from "../services/authServices"; // ✅ Validación de autenticación

export default function useContactManager() {
    const [confirmedContacts, setConfirmedContacts] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [receivedRequests, setReceivedRequests] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false); // ✅ Estado de autenticación

    // ✅ **Verificar autenticación y actualizar estado**
    useEffect(() => {
        const verifyAuthAndFetchContacts = async () => {
            try {
                const status = await checkAuthStatus();
                setIsAuthenticated(status.isAuthenticated);

                if (status.isAuthenticated) {
                    const contacts = await fetchContacts();
                    setConfirmedContacts(contacts.confirmed || []);
                    setPendingRequests(contacts.pending || []);
                    setReceivedRequests(contacts.requests || []);
                }
            } catch (error) {
                console.error("❌ Error verificando autenticación o contactos:", error);
            }
        };

        verifyAuthAndFetchContacts();

        window.addEventListener("walletConnected", verifyAuthAndFetchContacts);
        window.addEventListener("walletDisconnected", () => {
            setConfirmedContacts([]);
            setPendingRequests([]);
            setReceivedRequests([]);
        });

        return () => {
            window.removeEventListener("walletConnected", verifyAuthAndFetchContacts);
            window.removeEventListener("walletDisconnected", () => {
                setConfirmedContacts([]);
                setPendingRequests([]);
                setReceivedRequests([]);
            });
        };
    }, []);

    // ✅ **Enviar solicitud de contacto**
    const handleAddContact = async (wallet) => {
        if (!isAuthenticated) return alert("⚠️ Debes estar autenticado para agregar contactos.");

        try {
            await sendContactRequest(wallet);
            await fetchContacts().then(({ confirmed, pending, requests }) => {
                setConfirmedContacts(confirmed || []);
                setPendingRequests(pending || []);
                setReceivedRequests(requests || []);
            });
        } catch (error) {
            console.error("❌ Error enviando solicitud de contacto:", error);
        }
    };

    // ✅ **Aceptar solicitud de contacto**
    const handleAcceptRequest = async (wallet) => {
        if (!isAuthenticated) return alert("⚠️ Debes estar autenticado para aceptar contactos.");

        try {
            await approveContact(wallet);
            await fetchContacts().then(({ confirmed, pending, requests }) => {
                setConfirmedContacts(confirmed || []);
                setPendingRequests(pending || []);
                setReceivedRequests(requests || []);
            });
        } catch (error) {
            console.error("❌ Error aceptando solicitud de contacto:", error);
        }
    };

    // ✅ **Rechazar solicitud de contacto**
    const handleRejectRequest = async (wallet) => {
        if (!isAuthenticated) return alert("⚠️ Debes estar autenticado para rechazar contactos.");

        try {
            await rejectContact(wallet);
            await fetchContacts().then(({ confirmed, pending, requests }) => {
                setConfirmedContacts(confirmed || []);
                setPendingRequests(pending || []);
                setReceivedRequests(requests || []);
            });
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
