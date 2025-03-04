import React, { useEffect, useState, memo, useCallback } from "react";
import { useWallet } from "../../contexts/WalletContext";
import { getContacts, approveContact, rejectContact } from "../../services/apiService.js";
import "./ContactRequests.css";

const ContactRequests = () => {
  const { walletAddress, isReady } = useWallet();
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  // ✅ **Obtener solicitudes de contacto**
  useEffect(() => {
    if (!isReady || !walletAddress) return;

    let isMounted = true;

    const fetchContactRequests = async () => {
      try {
        const { pending, received } = await getContacts();
        if (isMounted) {
          setReceivedRequests(received || []);
          setSentRequests(pending || []);
        }
      } catch (error) {
        console.error("❌ Error al obtener solicitudes de contacto:", error);
        if (isMounted) setErrorMessage("❌ Error al cargar solicitudes.");
      }
    };

    fetchContactRequests();

    return () => {
      isMounted = false;
    };
  }, [isReady, walletAddress]);

  // ✅ **Manejo de solicitudes de contacto**
  const handleAction = useCallback(async (pubkey, action) => {
    try {
      if (action === "approve") {
        await approveContact(pubkey);
        setReceivedRequests((prev) => prev.filter((req) => req.wallet !== pubkey));
      } else {
        await rejectContact(pubkey);
        setReceivedRequests((prev) => prev.filter((req) => req.wallet !== pubkey));
      }
    } catch (error) {
      console.error(`❌ Error al ${action === "approve" ? "aceptar" : "rechazar"} contacto:`, error);
      setErrorMessage(`❌ No se pudo ${action === "approve" ? "aceptar" : "rechazar"} la solicitud.`);
    }
  }, []);

  return (
    <div className="contact-requests-container">
      <h3>📩 Solicitudes de Contacto</h3>

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <div className="requests-section">
        <h4>📥 Recibidas</h4>
        {receivedRequests.length > 0 ? (
          <ul className="requests-list">
            {receivedRequests.map(({ wallet }) => (
              <li key={wallet}>
                {wallet.slice(0, 6)}...{wallet.slice(-4)}
                <button onClick={() => handleAction(wallet, "approve")}>✅</button>
                <button onClick={() => handleAction(wallet, "reject")}>❌</button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-requests">No tienes solicitudes pendientes.</p>
        )}
      </div>

      <div className="requests-section">
        <h4>📤 Enviadas</h4>
        {sentRequests.length > 0 ? (
          <ul className="requests-list">
            {sentRequests.map(({ wallet }) => (
              <li key={wallet}>
                {wallet.slice(0, 6)}...{wallet.slice(-4)} (Pendiente)
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-requests">No has enviado solicitudes.</p>
        )}
      </div>
    </div>
  );
};

export default memo(ContactRequests);
