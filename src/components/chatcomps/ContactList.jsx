import React, { useState, useEffect, useCallback } from "react";
import useContactManager from "../../hooks/useContactManager";
import { useWallet } from "../../contexts/WalletContext"; // ✅ USAR CONTEXTO GLOBAL
import AddContactForm from "./AddContactForm";
import "./ContactList.css";

function ContactList({ onSelectContact }) {
  const { walletAddress, walletStatus, isReady } = useWallet(); // ✅ Obtener datos del contexto global
  const isAuthenticated = walletStatus === "authenticated"; // ✅ Validación correcta de autenticación

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

  // ✅ Verificar que el contexto esté cargado
  if (!isReady) {
    return <p className="auth-warning">🔒 Cargando datos de la wallet...</p>;
  }

  // ✅ Cambio de vista entre contactos y solicitudes
  const toggleView = () => {
    setView(view === "contacts" ? "received" : "contacts");
  };

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

      <button
        className="requests-button"
        onClick={toggleView}
        disabled={!walletAddress}
      >
        {view === "contacts" ? "📩 Solicitudes" : "⬅️ Volver"}
      </button>

      {!walletAddress && (
        <p className="auth-warning">
          ⚠️ Conéctate a una wallet para gestionar contactos.
        </p>
      )}

      {view === "contacts" ? (
        <ul className="contact-list">
          {confirmedContacts.length > 0 ? (
            confirmedContacts.map((contact) => (
              <li
                key={contact.wallet}
                className="contact-item"
                onClick={() => onSelectContact(contact.wallet)}
              >
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
            <button
              className={`request-tab ${
                view === "received" ? "active" : ""
              }`}
              onClick={() => setView("received")}
            >
              📥 Recibidas ({receivedRequests.length})
            </button>
            <button
              className={`request-tab ${view === "sent" ? "active" : ""}`}
              onClick={() => setView("sent")}
            >
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
                          await handleAcceptRequest(contact.wallet);
                          fetchContacts();
                        }}
                      >
                        ✅
                      </button>
                      <button
                        onClick={async () => {
                          await handleRejectRequest(contact.wallet);
                          fetchContacts();
                        }}
                      >
                        ❌
                      </button>
                    </li>
                  ))
                ) : (
                  <p className="no-contacts-message">
                    No tienes solicitudes recibidas.
                  </p>
                )}
              </ul>
            ) : (
              <ul className="contact-list">
                {pendingRequests.length > 0 ? (
                  pendingRequests.map((contact) => (
                    <li key={contact.wallet}>{contact.wallet} (Pendiente)</li>
                  ))
                ) : (
                  <p className="no-contacts-message">
                    No has enviado solicitudes aún.
                  </p>
                )}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Botón flotante para agregar contacto */}
      <button
        className="floating-add-button"
        onClick={handleAddContact}
        disabled={!walletAddress || !isAuthenticated}
      >
        ➕
      </button>

      {/* Modal para agregar contacto */}
      {showAddContactModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowAddContactModal(false)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setShowAddContactModal(false)}
            >
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
