export async function connectWallet(wallet) {
    try {
        console.log("Selected wallet:", wallet); // Log para saber qué wallet se está seleccionando
        
        let provider;

        // Detecta el proveedor según el wallet seleccionado
        if (wallet === "phantom" && window.solana?.isPhantom) {
            provider = window.solana;
        } else if (wallet === "backpack" && window.solana?.isBackpack) {
            provider = window.solana;
        } else if (wallet === "magiceden" && window.magicEden?.isMagicEden) {
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
