import React, { useRef, useState } from "react";
import { signMessage } from "../../services/walletService";
import { loginWithSignature } from "../../services/authServices";

const SignatureValidation = ({ wallet, onSuccess }) => {
    const isSigning = useRef(false); // ✅ Evitar múltiples firmas simultáneas
    const [errorMessage, setErrorMessage] = useState(null);

    const handleSignMessage = async () => {
        if (isSigning.current) return;
        isSigning.current = true;
        setErrorMessage(null); // ✅ Limpiar errores previos

        try {
            if (!wallet || (typeof wallet === "string" && !wallet.trim())) {
                throw new Error("⚠️ No se ha detectado una wallet válida.");
            }

            const publicKey = typeof wallet === "string" ? wallet : wallet.publicKey.toString();

            const message = "Please sign this message to authenticate."; // 🔹 Mejorable con un mensaje único por sesión
            const signedData = await signMessage(wallet, message);
            console.log("✅ Firma generada:", signedData);

            const token = await loginWithSignature(publicKey, signedData.signature, message);
            console.log("✅ Token JWT recibido:", token);

            onSuccess(token);
        } catch (error) {
            console.error("❌ Error al firmar el mensaje:", error);
            setErrorMessage(error.message || "❌ No se pudo firmar el mensaje.");
        } finally {
            isSigning.current = false;
        }
    };

    return (
        <div className="signature-container">
            <button onClick={handleSignMessage} disabled={isSigning.current}>
                {isSigning.current ? "Firmando..." : "Firmar Mensaje"}
            </button>
            {errorMessage && <p className="error-message">{errorMessage}</p>} {/* ✅ Muestra errores sin alert() */}
        </div>
    );
};

export default SignatureValidation;
