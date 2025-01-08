import nacl from "tweetnacl";
import { Connection, PublicKey } from "@solana/web3.js";
import { getAccessToken } from '../services/tokenService'; // Importar funciones de tokenService
import { apiRequest } from '../services/apiService'; // Importar apiRequest de apiService

const RPC_URL = 'https://rpc.ankr.com/solana_devnet/84d7f098a02eb4c502839fa2cff526bb9d0ee07aa75c19ecf28f8925a824ba59'; // Cambia esto a tu endpoint de Ankr

export async function connectWallet(wallet) {
    try {
        console.log("Selected wallet:", wallet); // Log para saber qué wallet se está seleccionando
        
        let provider;

        // Detecta el proveedor según el wallet seleccionado
        if (wallet === "phantom" && window.solana?.isPhantom) {
            provider = window.solana;
        } else if (wallet === "backpack" && window.xnft?.solana) {
            console.log("Backpack Wallet detected");
            provider = window.xnft.solana;
        } else if (wallet === "magiceden" && window.magicEden?.isMagicEden) {
            console.log("Magic Eden Wallet detected");
            provider = window.magicEden;
        } else {
            console.error(`${wallet} Wallet not detected`);
        }

        if (!provider) {
            alert(`Please install ${wallet} Wallet to continue.`);
            return null;
        }

        // Solicita al usuario que conecte la wallet usando el proveedor detectado
        const response = await provider.connect({ onlyIfTrusted: false });
        console.log("Connection response:", response); // Log para verificar la respuesta de conexión

        // Verifica que la conexión fue exitosa y retorna la dirección pública
        if (!response.publicKey) {
            throw new Error(`Connection to ${wallet} cancelled by the user.`);
        }
        
        return response.publicKey.toString();
    } catch (error) {
        console.error(`Error al conectar ${wallet} Wallet:`, error);
        throw new Error(`Failed to connect ${wallet} Wallet.`);
    }
}

// Nueva función para obtener el balance de una wallet
export async function getBalance(walletAddress) {
    try {
        const connection = new Connection(RPC_URL, 'confirmed');
        const publicKey = new PublicKey(walletAddress);

        // Obtener el balance en lamports y convertirlo a SOL
        const balanceLamports = await connection.getBalance(publicKey);
        const balanceSol = balanceLamports / 1e9; // Convertir de lamports a SOL

        console.log(`Balance for ${walletAddress}: ${balanceSol} SOL`);
        return balanceSol;
    } catch (error) {
        console.error(`Error al obtener el balance de la wallet ${walletAddress}:`, error);
        throw new Error(`Failed to fetch balance for wallet ${walletAddress}.`);
    }
}

// Función para realizar una solicitud autenticada a la API de Solana
export async function fetchSolanaData(endpoint) {
    try {
        const accessToken = await getAccessToken();

        console.log('JWT Token:', accessToken);

        console.log('Realizando solicitud autenticada a:', endpoint);
        const response = await apiRequest(endpoint, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Error en la solicitud a ${endpoint}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Datos recibidos:', data);
        return data;
    } catch (error) {
        console.error('Error fetching Solana data:', error);
        throw new Error('Failed to fetch Solana data.');
    }
}

// Función para firmar un mensaje con la wallet del usuario
export async function signMessage(message) {
    const selectedWallet = localStorage.getItem("selectedWallet");
    if (!selectedWallet) {
        throw new Error("No hay wallet seleccionada.");
    }

    const walletProvider = window[selectedWallet.toLowerCase()];
    if (!walletProvider) {
        throw new Error(`El proveedor ${selectedWallet} no está disponible.`);
    }

    try {
        const encodedMessage = new TextEncoder().encode(message);
        const signature = await walletProvider.signMessage(encodedMessage, "utf8");
        return signature;
    } catch (error) {
        console.error("Error al firmar el mensaje:", error);
        throw error;
    }
}

// Función para desconectar una wallet
export async function disconnectWallet(wallet) {
    try {
        let provider;

        // Detecta el proveedor según el wallet seleccionado
        if (wallet === "phantom" && window.solana?.isPhantom) {
            provider = window.solana;
        } else if (wallet === "backpack" && window.xnft?.solana) {
            provider = window.xnft.solana;
        } else if (wallet === "magiceden" && window.magicEden?.isMagicEden) {
            provider = window.magicEden;
        } else {
            throw new Error(`${wallet} Wallet not detected`);
        }

        if (provider && provider.disconnect) {
            await provider.disconnect();
            console.log(`${wallet} Wallet disconnected`);
        }
    } catch (error) {
        console.error(`Error disconnecting ${wallet} Wallet:`, error);
        throw new Error(`Failed to disconnect ${wallet} Wallet.`);
    }
}
