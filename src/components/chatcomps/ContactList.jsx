import React, { useState, useEffect } from "react";
import useContactManager from "../../hooks/useContactManager";
import { useWallet } from "../../contexts/WalletContext"; // ✅ Contexto Global
import AddContactForm from "./AddContactForm";
import { checkAuthStatus } from "../../services/authServices.js"; // ✅ Validación de autenticación con el backend
import "./ContactList.css";

function ContactList({ onSelectContact }) {
  const { walletAddress, walletStatus, isReady } = useWallet(); // ✅ Estado de la wallet
  const [isAuthenticated, setIsAuthenticated] = useState(false); // ✅ Estado autenticado

  const {
    confirmedContacts,
    pendingRequests,
    receivedRequests,
    handleAcceptRequest,
    handleRejectRequest,
    fetchContacts,
  } = useContactManager();

  const [view, setView] = useState("contacts");
  const [showAddContactModal, setShowAddContactModal] = useState(false);

  // ✅ Verificar autenticación con el backend antes de gestionar contactos
  useEffect(() => {
    const verifyAuth = async () => {
      if (walletAddress) {
        const status = await checkAuthStatus();
        setIsAuthenticated(status.isAuthenticated);
      } else {
        setIsAuthenticated(false);
      }
    };

    verifyAuth();
  }, [walletAddress]);

  // ✅ Si la wallet aún está cargando, mostrar mensaje
  if (!isReady) {
    return <p className="auth-warning">🔒 Cargando datos de la wallet...</p>;
  }

  // ✅ Cambio de vista entre contactos y solicitudes
  const toggleView = () => setView(view === "contacts" ? "received" : "contacts");

  // 🔒 Verifica autenticación antes de abrir el modal
  const handleAddContact = () => {
    if (!isAuthenticated) {
      alert("⚠️ Debes estar autenticado para agregar un contacto.");
      return;
    }
    setShowAddContactModal(true);
  };

  return (
    <div className="contact-list-container">
      <h3>📞 Contactos</h3>

      <button className="requests-button" onClick={toggleView} disabled={!walletAddress}>
        {view === "contacts" ? "📩 Solicitudes" : "⬅️ Volver"}
      </button>

      {!walletAddress && <p className="auth-warning">⚠️ Conéctate a una wallet para gestionar contactos.</p>}

      {view === "contacts" ? (
        <ul className="contact-list">
          {confirmedContacts.length > 0 ? (
            confirmedContacts.map((contact) => (
              <li key={contact.wallet} className="contact-item" onClick={() => onSelectContact(contact.wallet)}>
                {contact.wallet.slice(0, 6)}...{contact.wallet.slice(-4)}
              </li>
            ))
          ) : (
            <p className="no-contacts-message">Aún no tienes contactos.</p>
          )}
        </ul>
      ) : (
        <div>
          <div className="request-tabs">
            <button className={`request-tab ${view === "received" ? "active" : ""}`} onClick={() => setView("received")}>
              📥 Recibidas ({receivedRequests.length})
            </button>
            <button className={`request-tab ${view === "sent" ? "active" : ""}`} onClick={() => setView("sent")}>
              📤 Enviadas ({pendingRequests.length})
            </button>
          </div>
          <div className="requests-container">
            {view === "received" ? (
              <ul className="contact-list">
                {receivedRequests.length > 0 ? (
                  receivedRequests.map((contact) => (
                    <li key={contact.wallet}>
                      {contact.wallet}
                      <button
                        onClick={async () => {
                          if (!isAuthenticated) return;
                          await handleAcceptRequest(contact.wallet);
                          fetchContacts();
                        }}
                      >
                        ✅
                      </button>
                      <button
                        onClick={async () => {
                          if (!isAuthenticated) return;
                          await handleRejectRequest(contact.wallet);
                          fetchContacts();
                        }}
                      >
                        ❌
                      </button>
                    </li>
                  ))
                ) : (
                  <p className="no-contacts-message">No tienes solicitudes recibidas.</p>
                )}
              </ul>
            ) : (
              <ul className="contact-list">
                {pendingRequests.length > 0 ? (
                  pendingRequests.map((contact) => <li key={contact.wallet}>{contact.wallet} (Pendiente)</li>)
                ) : (
                  <p className="no-contacts-message">No has enviado solicitudes aún.</p>
                )}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Botón flotante para agregar contacto */}
      <button className="floating-add-button" onClick={handleAddContact} disabled={!walletAddress || !isAuthenticated}>
        ➕
      </button>

      {/* Modal para agregar contacto */}
      {showAddContactModal && (
        <div className="modal-overlay" onClick={() => setShowAddContactModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAddContactModal(false)}>
              X
            </button>
            <AddContactForm
              onContactAdded={() => {
                setShowAddContactModal(false);
                fetchContacts();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ContactList;
