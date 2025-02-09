import React, { useRef } from 'react';
import { signMessage } from '../services/walletService'; 
import { loginWithSignature } from '../services/authServices';

const SignatureValidation = ({ wallet, onSuccess, onError }) => {
    const isSigning = useRef(false); // Evitar múltiples firmas

    // Manejo de la firma de mensajes
    const handleSignMessage = async () => {
        if (isSigning.current) return; // Prevenir firma simultánea
        isSigning.current = true;

        try {
            const message = "Please sign this message to authenticate.";
            const signedData = await signMessage(wallet, message); // Asegúrate de pasar wallet correctamente
            console.log("Signed data:", signedData);

            const token = await loginWithSignature(wallet.publicKey.toString(), signedData.signature, message);
            console.log("JWT Token:", token);

            // Invocar el callback onSuccess con el token
            onSuccess(token);
        } catch (error) {
            console.error("Error signing message:", error);
            if (onError) onError(error); // Llamada a onError si se proporciona
            alert(`Failed to sign message with ${wallet}. Please try again.`);
        } finally {
            isSigning.current = false;
        }
    };

    return (
        <button onClick={handleSignMessage} disabled={isSigning.current}>
            {isSigning.current ? 'Signing...' : 'Sign Message'}
        </button>
    );
};

export default SignatureValidation;
