import { apiRequest } from "../services/apiService.js";

export async function loginWithSignature(pubkey, signature, message) {
    try {
        const data = await apiRequest('/api/auth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pubkey, signature, message }),
        });

        if (!data.token) {
            throw new Error('Failed to retrieve token from server.');
        }

        setToken(data.token);
        return data.token;
    } catch (error) {
        console.error('Error logging in with signature:', error);
        throw error;
    }
}
