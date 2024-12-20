import React from 'react';
import { signMessage } from '../utils/solanaHelpers';

const SignatureValidation = ({ wallet, onSuccess }) => {
    const handleSignMessage = async () => {
        try {
            const message = "Please sign this message to authenticate.";
            const signedData = await signMessage(wallet, message);
            console.log("Signed data:", signedData); // Log de datos firmados

            // Simulación de éxito
            onSuccess(signedData);
        } catch (error) {
            console.error(`Error signing message with ${wallet} Wallet:`, error);
            alert(`Failed to sign message with ${wallet} Wallet. Please try again.`);
        }
    };

    return (
        <button onClick={handleSignMessage}>
            Sign Message
        </button>
    );
};

export default SignatureValidation;
