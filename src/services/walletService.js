import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

const connection = new Connection(clusterApiUrl('mainnet-beta'));

let activeWalletProvider = null;
let activeWalletType = null;

const WALLET_PROVIDERS = {
    phantom: () => window.solana?.isPhantom && window.solana,
    backpack: () => window.xnft?.solana,
    magiceden: () => window.magicEden?.solana,
};

function getProvider(wallet) {
    const provider = WALLET_PROVIDERS[wallet]?.();
    if (!provider) {
        throw new Error(`${wallet} Wallet not detected`);
    }
    return provider;
}

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
        return response.publicKey.toString();
    } catch (error) {
        console.error(`Error connecting ${wallet} Wallet:`, error);
        throw error;
    }
}

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

export function getConnectedWallet() {
    const walletType = localStorage.getItem('walletType');
    const walletAddress = localStorage.getItem('walletAddress');
    return walletAddress ? { walletType, walletAddress } : null;
}

export async function signMessage(message) {
    try {
        if (!activeWalletProvider) {
            throw new Error("No wallet connected. Connect a wallet first.");
        }

        const encodedMessage = new TextEncoder().encode(message);
        const { signature } = await activeWalletProvider.signMessage(encodedMessage);

        const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)));

        console.log("Message signed:", { message, signatureBase64 });
        return {
            signature: signatureBase64,
            message,
            pubkey: activeWalletProvider.publicKey.toBase58(),
        };
    } catch (error) {
        console.error(`Error signing message with ${activeWalletType} Wallet:`, error);
        throw error;
    }
}

export function verifySignature(message, signature, publicKey) {
    try {
        const encodedMessage = new TextEncoder().encode(message);
        const pubKey = new PublicKey(publicKey);
        const signatureUint8Array = Uint8Array.from(atob(signature), c => c.charCodeAt(0));

        const isValid = pubKey.verify(encodedMessage, signatureUint8Array);
        console.log(`Signature valid: ${isValid}`);
        return isValid;
    } catch (error) {
        console.error('Error verifying signature:', error);
        return false;
    }
}

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
