import { Connection, PublicKey } from "@solana/web3.js";
const RPC_URL = 'https://rpc.ankr.com/solhttps://rpc.ankr.com/solana_devnet/84d7f098a02eb4c502839fa2cff526bb9d0ee07aa75c19ecf28f8925a824ba59ana_devnet/YOUR_API_KEY'; // Cambia esto a tu endpoint de Ankr

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
        } else if (wallet === "magiceden") {
            console.log("Checking Magic Eden Wallet...");
            console.log("window.magicEden:", window.magicEden);
            console.log("Magic Eden Solana Provider:", window.magicEden?.solana);
        
            if (window.magicEden?.solana) {
                console.log("Magic Eden Wallet detected");
                provider = window.magicEden.solana;
            } else {
                console.error("Magic Eden Wallet not detected or improperly configured.");
            }
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
