import { authenticateWithServer } from "./authServices";
import { getProvider } from "./walletProviders"; // ✅ Usa correctamente `getProvider()`
import { getConnectedWallet } from "./walletService"; // ✅ Importamos `getConnectedWallet()`
import bs58 from "bs58"; // Codificación Base58

/**
 * **Firmar mensaje con la wallet**
 */
async function signMessage(wallet, message) {
    try {
        console.log(`🟡 Solicitando firma a ${wallet}...`);
        const provider = getProvider(wallet);
        if (!provider) return { signature: null, error: "No provider found" };

        const encodedMessage = new TextEncoder().encode(message);
        const { signature } = await provider.signMessage(encodedMessage);
        const signatureBase58 = bs58.encode(signature);

        console.log("✅ Firma generada:", signatureBase58);
        return { signature: signatureBase58, message, pubkey: provider.publicKey.toBase58() };
    } catch (error) {
        console.error("❌ Error en signMessage():", error.message || error);
        return { signature: null, error: error.message || error };
    }
}

/**
 * **Autenticar wallet con el backend**
 */
async function authenticateWallet(wallet) {
    try {
        const { walletAddress } = await getConnectedWallet();
        if (!walletAddress) {
            console.warn("⚠️ No hay wallet conectada. Se requiere conexión antes de autenticar.");
            return { pubkey: null, status: "not_connected" };
        }

        console.log("🔄 Iniciando autenticación...");
        const message = "Please sign this message to authenticate.";
        const signedData = await signMessage(wallet, message);
        if (!signedData.signature) throw new Error("❌ Firma rechazada.");

        console.log("🔵 Enviando firma al backend...");
        const response = await authenticateWithServer(
            signedData.pubkey, 
            signedData.signature, 
            message
        );

        if (!response || !response.message) {
            throw new Error("❌ Respuesta inválida del backend.");
        }

        console.log("✅ Autenticación exitosa en backend.");
        return { pubkey: walletAddress, status: "authenticated" };
    } catch (error) {
        console.error("❌ Error en authenticateWallet():", error.message || error);
        return { pubkey: null, status: "error" };
    }
}

export { authenticateWallet, signMessage };
