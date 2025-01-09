import React, { useRef } from 'react';
import { signMessage } from '../utils/solanaHelpers';
import { loginWithSignature } from '../services/authServices';

const SignatureValidation = ({ wallet, onSuccess }) => {
    const isSigning = useRef(false); // Añadir un ref para controlar la firma

    const handleSignMessage = async () => {
        if (isSigning.current) return; // Evitar múltiples firmas
        isSigning.current = true;

        try {
            const message = "Please sign this message to authenticate.";
            const signedData = await signMessage(wallet, message);
            console.log("Signed data:", signedData); // Log de datos firmados

            const token = await loginWithSignature(wallet.publicKey.toString(), signedData.signature, message);
            console.log("JWT Token:", token); // Log del token JWT

            onSuccess(token);
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
