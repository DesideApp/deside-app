import { authenticateWithServer } from './authServices'; // Importa la función para autenticar

let activeWalletProvider = null;
let activeWalletType = null;

const WALLET_PROVIDERS = {
    phantom: () => window.solana?.isPhantom && window.solana,
    backpack: () => window.xnft?.solana,
    magiceden: () => window.magicEden?.solana,
};

// Función para obtener el proveedor de la billetera
function getProvider(wallet) {
    const provider = WALLET_PROVIDERS[wallet]?.();
    if (!provider) {
        throw new Error(`${wallet} Wallet not detected`);
    }
    return provider;
}

// Conectar la billetera y generar JWT
export async function connectWallet(wallet) {
    try {
        console.log(`🔵 Intentando conectar con ${wallet}`);

        const provider = getProvider(wallet);
        const response = await provider.connect({ onlyIfTrusted: false });

        if (!response.publicKey) {
            throw new Error(`❌ Conexión cancelada por el usuario.`);
        }

        console.log(`✅ ${wallet} conectado: ${response.publicKey.toString()}`);

        // Firmar el mensaje y obtener el JWT
        const message = "Please sign this message to authenticate.";
        const signedData = await signMessage(wallet, message);

        console.log("🔵 Firma generada:", signedData);

        // Intentar autenticar con el servidor
        console.log("🔵 Enviando autenticación al servidor...");
        const token = await authenticateWithServer(response.publicKey.toString(), signedData.signature, message);

        console.log("✅ Token JWT recibido:", token);

        return response.publicKey.toString();
    } catch (error) {
        console.error(`❌ Error en connectWallet():`, error);
        throw error;
    }
}


// Desconectar la billetera
export async function disconnectWallet() {
    try {
        if (activeWalletProvider?.disconnect) {
            await activeWalletProvider.disconnect();
            console.log(`${activeWalletType} Wallet disconnected`);
        }

        activeWalletProvider = null;
        activeWalletType = null;
    } catch (error) {
        console.error(`Error disconnecting wallet:`, error);
        throw error;
    }
}

// Obtener la billetera conectada
export function getConnectedWallet() {
    const walletType = localStorage.getItem('walletType');
    const walletAddress = localStorage.getItem('walletAddress');
    return walletAddress ? { walletType, walletAddress } : null;
}

// Firmar el mensaje
export async function signMessage(wallet, message) {
    try {
        console.log(`🟡 Solicitando firma a ${wallet}...`);

        const provider = getProvider(wallet);
        if (!provider) {
            throw new Error("❌ No hay una billetera conectada.");
        }

        const encodedMessage = new TextEncoder().encode(message);
        const { signature } = await provider.signMessage(encodedMessage);

        console.log("✅ Firma generada:", signature);

        return {
            signature: btoa(String.fromCharCode(...new Uint8Array(signature))),
            message,
            pubkey: provider.publicKey.toBase58(),
        };
    } catch (error) {
        console.error(`❌ Error en signMessage():`, error);
        throw error;
    }
}



// Obtener el balance de la billetera
export async function getWalletBalance(walletAddress) {
    try {
        if (!walletAddress) throw new Error("Wallet address is required");

        const balance = await connection.getBalance(new PublicKey(walletAddress));
        return balance / 1e9; // Convertir lamports a SOL
    } catch (error) {
        console.error("Error fetching wallet balance:", error);
        throw error;
    }
}
