export async function connectWallet() {
    try {
        let provider;

        // Detecta el proveedor según el wallet seleccionado
        if (wallet === "phantom" && window.solana?.isPhantom) {
            provider = window.solana;
        } else if (wallet === "backpack" && window.solana?.isBackpack) {
            provider = window.solana;
        } else if (wallet === "magiceden" && window.magicEden?.isMagicEden) {
            provider = window.magicEden;
        }

        if (!provider) {
            alert(`Please install ${wallet} Wallet to continue.`);
            return null;
        }

        // Solicita al usuario que conecte la wallet. Abre Phantom Wallet incluso si ya está conectado.
        const response = await window.solana.connect({ onlyIfTrusted: false });

        // Verifica que la conexión fue exitosa y retorna la dirección pública
        if (!response.publicKey) {
            throw new Error("Conexión cancelada por el usuario.");
        }

        return response.publicKey.toString();
    } catch (error) {
        console.error("Error al conectar la wallet:", error);
        throw new Error("No se pudo conectar con Phantom Wallet.");
    }
}
