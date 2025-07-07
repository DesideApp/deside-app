import React, { useEffect, useState, memo, useCallback } from "react";
import { fetchContacts, approveContact, rejectContact } from "../../services/contactService.js";
import "./ContactRequests.css";

const ContactRequests = () => {
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchReceived = async () => {
      try {
        const contacts = await fetchContacts();
        if (isMounted) {
          setReceivedRequests(contacts.incoming || []);
        }
      } catch (error) {
        console.error("❌ Error al obtener solicitudes:", error);
        if (isMounted) setErrorMessage("❌ Error al cargar solicitudes.");
      }
    };

    fetchReceived();
    return () => { isMounted = false; };
  }, []);

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
      <h3>📥 Incoming Requests</h3>
      {errorMessage && <p className="error-message">{errorMessage}</p>}

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
        <p className="no-requests">No incoming requests.</p>
      )}
    </div>
  );
};

export default memo(ContactRequests);
