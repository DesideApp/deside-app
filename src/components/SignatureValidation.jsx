import React, { useRef } from 'react';
import { signMessage } from '../utils/solanaHelpers';

const SignatureValidation = ({ wallet, onSuccess }) => {
    const isSigning = useRef(false); // Añadir un ref para controlar la firma

    const handleSignMessage = async () => {
        if (isSigning.current) return; // Evitar múltiples firmas
        isSigning.current = true;

        try {
            const message = "Please sign this message to authenticate.";
            const signedData = await signMessage(wallet, message);
            console.log("Signed data:", signedData); // Log de datos firmados

            // Enviar la firma al backend para verificarla y generar un token JWT
            const response = await fetch('https://backend-deside.onrender.com/api/auth/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    pubkey: wallet.publicKey.toString(),
                    signature: signedData.signature,
                    message: message,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to verify signature.');
            }

            const data = await response.json();
            console.log("JWT Token:", data.token); // Log del token JWT

            // Simulación de éxito
            onSuccess(data.token);
        } catch (error) {
            console.error(`Error signing message with ${wallet} Wallet:`, error);
            alert(`Failed to sign message with ${wallet} Wallet. Please try again.`);
        } finally {
            isSigning.current = false;
        }
    };

    return (
        <button onClick={handleSignMessage}>
            Sign Message
        </button>
    );
};

export default SignatureValidation;
