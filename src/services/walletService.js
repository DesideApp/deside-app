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
        const provider = getProvider(wallet);
        const response = await provider.connect({ onlyIfTrusted: false });

        if (!response.publicKey) {
            throw new Error(`Connection to ${wallet} cancelled by the user.`);
        }

        activeWalletProvider = provider;
        activeWalletType = wallet;

        console.log(`${wallet} Wallet connected: ${response.publicKey.toString()}`);

        // Firmar el mensaje y obtener el JWT
        const message = "Please sign this message to authenticate.";
        const signedData = await signMessage(wallet, message);

        // Enviar la firma al servidor para obtener el JWT
        await authenticateWithServer(response.publicKey.toString(), signedData.signature, message);

        return response.publicKey.toString();
    } catch (error) {
        console.error(`Error connecting ${wallet} Wallet:`, error);
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
        const provider = getProvider(wallet);
        if (!provider) {
            throw new Error("No wallet connected. Connect a wallet first.");
        }

        const encodedMessage = new TextEncoder().encode(message);
        const { signature } = await provider.signMessage(encodedMessage);

        return {
            signature: btoa(String.fromCharCode(...new Uint8Array(signature))),
            message,
            pubkey: provider.publicKey.toBase58(),
        };
    } catch (error) {
        console.error(`Error signing message with ${wallet} Wallet:`, error);
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
