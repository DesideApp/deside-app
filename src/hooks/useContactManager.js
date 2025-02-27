import { useState, useEffect, useCallback } from "react";
import { fetchContacts, sendContactRequest, approveContact, rejectContact } from "../services/contactService";
import { checkAuthStatus } from "../services/authServices"; // ✅ Validación de autenticación

export default function useContactManager() {
    const [confirmedContacts, setConfirmedContacts] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [receivedRequests, setReceivedRequests] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false); // ✅ Estado de autenticación

    // ✅ Verificar autenticación antes de hacer cualquier acción
    const validateAuth = useCallback(async () => {
        try {
            const status = await checkAuthStatus();
            setIsAuthenticated(status.isAuthenticated);
            return status.isAuthenticated;
        } catch (error) {
            console.error("❌ Error verificando autenticación:", error);
            return false;
        }
    }, []);

    // ✅ Actualizar la lista de contactos solo si el usuario está autenticado
    const updateContacts = useCallback(async () => {
        if (!(await validateAuth())) {
            console.warn("⚠️ Usuario no autenticado. No se pueden cargar contactos.");
            return;
        }

        try {
            const contacts = await fetchContacts();
            setConfirmedContacts(contacts.confirmed || []);
            setPendingRequests(contacts.pending || []);
            setReceivedRequests(contacts.requests || []);
        } catch (error) {
            console.error("❌ Error al obtener contactos:", error);
        }
    }, [validateAuth]);

    // ✅ Sincronizar estado de autenticación con contactos
    useEffect(() => {
        const checkAuthAndFetchContacts = async () => {
            if (await validateAuth()) {
                await updateContacts();
            }
        };

        checkAuthAndFetchContacts();

        const handleDisconnect = () => {
            setConfirmedContacts([]);
            setPendingRequests([]);
            setReceivedRequests([]);
        };

        window.addEventListener("walletConnected", checkAuthAndFetchContacts);
        window.addEventListener("walletDisconnected", handleDisconnect);

        return () => {
            window.removeEventListener("walletConnected", checkAuthAndFetchContacts);
            window.removeEventListener("walletDisconnected", handleDisconnect);
        };
    }, [updateContacts]);

    // ✅ Enviar solicitud de contacto (solo si autenticado)
    const handleAddContact = async (wallet) => {
        if (!(await validateAuth())) return alert("⚠️ Debes estar autenticado para agregar contactos.");

        try {
            await sendContactRequest(wallet);
            await updateContacts();
        } catch (error) {
            console.error("❌ Error enviando solicitud de contacto:", error);
        }
    };

    // ✅ Aceptar solicitud de contacto (solo si autenticado)
    const handleAcceptRequest = async (wallet) => {
        if (!(await validateAuth())) return alert("⚠️ Debes estar autenticado para aceptar contactos.");

        try {
            await approveContact(wallet);
            await updateContacts();
        } catch (error) {
            console.error("❌ Error aceptando solicitud de contacto:", error);
        }
    };

    // ✅ Rechazar solicitud de contacto (solo si autenticado)
    const handleRejectRequest = async (wallet) => {
        if (!(await validateAuth())) return alert("⚠️ Debes estar autenticado para rechazar contactos.");

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
