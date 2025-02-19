import { setToken, isTokenExpired } from "./tokenService";
import { authenticateWithServer } from "./authServices";
import { getProvider } from "./walletProviders"; // ✅ Ahora importado correctamente
import { getConnectedWallet } from "./walletService"; // ✅ Importamos `getConnectedWallet()`
import bs58 from "bs58"; // Codificación Base58

// **Firmar mensaje con la wallet**
async function signMessage(wallet, message) {
    try {
        console.log(`🟡 Solicitando firma a ${wallet}...`);
        const provider = getProvider(wallet); // ✅ Ahora usa `getProvider()` desde `walletProviders.js`
        if (!provider) return { signature: null, error: "No provider found" };

        const encodedMessage = new TextEncoder().encode(message);
        const { signature } = await provider.signMessage(encodedMessage);
        const signatureBase58 = bs58.encode(signature);

        console.log("✅ Firma generada (Base58):", signatureBase58);
        return { signature: signatureBase58, message, pubkey: provider.publicKey.toBase58() };
    } catch (error) {
        console.error("❌ Error en signMessage():", error.message || error);
        return { signature: null, error: error.message || error };
    }
}

// **Autenticar wallet y obtener JWT**
async function authenticateWallet(wallet) {
    try {
        const { walletAddress } = await getConnectedWallet(); // ✅ Usamos `getConnectedWallet()` en vez de `localStorage`
        if (!walletAddress) {
            console.warn("⚠️ No hay wallet conectada. Se requiere conexión antes de autenticar.");
            return { pubkey: null, status: "not_connected" };
        }

        if (!isTokenExpired()) {
            console.log("✅ Token aún válido. No se necesita autenticación.");
            return { pubkey: walletAddress, status: "authenticated" };
        }

        const message = "Please sign this message to authenticate.";
        const signedData = await signMessage(wallet, message);
        if (!signedData.signature) throw new Error("❌ Firma rechazada.");

        console.log("🔵 Firma generada:", signedData);
        const token = await authenticateWithServer(walletAddress, signedData.signature, message);
        if (!token) throw new Error("❌ No se recibió un token válido.");

        console.log("✅ Token JWT recibido y almacenado.");
        setToken(token);

        return { pubkey: walletAddress, status: "authenticated" };
    } catch (error) {
        console.error("❌ Error en authenticateWallet():", error.message || error);
        return { pubkey: null, status: "error" };
    }
}

export { authenticateWallet, signMessage };
