import React, { useEffect, useState, memo, useCallback } from "react";
import {
  fetchContacts,
  approveContact,
  rejectContact,
} from "../../services/contactService.js";
import { searchUserByPubkey } from "../../services/userService.js";
import { notify } from "../../services/notificationService.js";
import "./ContactRequests.css";

const ContactRequests = ({ onContactAdded }) => {
  const [receivedRequests, setReceivedRequests] = useState([]);

  // ✅ Cargar solicitudes entrantes con nickname y bloqueado
  useEffect(() => {
    let isMounted = true;

    const fetchReceived = async () => {
      try {
        const contacts = await fetchContacts();
        const incoming = contacts.incoming || [];

        const enrichedRequests = await Promise.all(
          incoming.map(async (req) => {
            const result = await searchUserByPubkey(req.wallet);
            return {
              wallet: req.wallet,
              nickname: result.registered ? result.nickname : null,
              blocked: result.registered ? result.blocked : false,
            };
          })
        );

        if (isMounted) {
          setReceivedRequests(enrichedRequests);
        }
      } catch (error) {
        console.error("❌ Error al obtener solicitudes:", error);
        if (isMounted) {
          notify("❌ Error al cargar solicitudes.", "error");
        }
      }
    };

    fetchReceived();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAction = useCallback(
    async (pubkey, action) => {
      try {
        if (action === "approve") {
          // ✅ Solo impido aceptar si YO bloqueé al otro.
          // Si el otro me bloqueó, puedo igualmente intentar aprobar
          // (aunque probablemente no quiera mantener la relación).
          const result = await searchUserByPubkey(pubkey);
          if (result.error) {
            notify(result.message, "error");
            return;
          }

          if (result.blocked) {
            notify(
              "⚠️ You have blocked this user. Cannot accept the request.",
              "error"
            );
            return;
          }

          await approveContact(pubkey);
          notify("✅ Contact request accepted.", "success");

          if (onContactAdded) {
            onContactAdded();
          }
        } else {
          await rejectContact(pubkey);
          notify("✅ Contact request rejected.", "success");
        }

        setReceivedRequests((prev) =>
          prev.filter((req) => req.wallet !== pubkey)
        );
      } catch (error) {
        console.error(
          `❌ Error al ${action === "approve" ? "aceptar" : "rechazar"} contacto:`,
          error
        );
        notify(
          `❌ Could not ${
            action === "approve" ? "accept" : "reject"
          } the contact request.`,
          "error"
        );
      }
    },
    [onContactAdded]
  );

  return (
    <div className="contact-requests-container">
      <h3>📥 Incoming Requests</h3>

      {receivedRequests.length > 0 ? (
        <ul className="requests-list">
          {receivedRequests.map(({ wallet, nickname }) => (
            <li key={wallet}>
              {nickname
                ? `${nickname} (${wallet.slice(0, 6)}...${wallet.slice(-4)})`
                : `${wallet.slice(0, 6)}...${wallet.slice(-4)}`}
              <button onClick={() => handleAction(wallet, "approve")}>
                ✅
              </button>
              <button onClick={() => handleAction(wallet, "reject")}>
                ❌
              </button>
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
