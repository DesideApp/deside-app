import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';

const connection = new Connection(clusterApiUrl('mainnet-beta'));

let activeWalletProvider = null; 
let activeWalletType = null;

function getProvider(wallet) {
    if (wallet === "phantom" && window.solana?.isPhantom) {
        return window.solana;
    } else if (wallet === "backpack" && window.xnft?.solana) {
        return window.xnft.solana;
    } else if (wallet === "magiceden" && window.magicEden?.solana) {
        return window.magicEden.solana;
    } else {
        throw new Error(`${wallet} Wallet not detected`);
    }
}

export const connectWallet = async () => {
    const provider = window.solana;
    if (!provider) throw new Error('No wallet found');
    await provider.connect();
    return provider.publicKey.toString();
};

export const getBalance = async (publicKey) => {
    const balance = await connection.getBalance(new PublicKey(publicKey));
    return balance / 1e9; // Convertir lamports a SOL
};

export const signMessage = async (message) => {
    const provider = window.solana;
    if (!provider) throw new Error('No wallet found');
    const encodedMessage = new TextEncoder().encode(message);
    const signedMessage = await provider.signMessage(encodedMessage, 'utf8');
    return signedMessage;
};

export const getConnectedWallet = async () => {
    const provider = window.solana;
    if (provider && provider.isConnected) {
        return { walletAddress: provider.publicKey.toString() };
    }
    return null;
};

export const disconnectWallet = async () => {
    const provider = window.solana;
    if (provider) {
        await provider.disconnect();
    }
};

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
