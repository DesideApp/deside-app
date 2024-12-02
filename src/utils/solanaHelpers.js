export async function connectWallet() {
    try {
        // Detecta si el proveedor de Phantom está disponible
        const provider = window.solana;

        if (!provider || !provider.isPhantom) {
            alert("Por favor, instala Phantom Wallet para continuar.");
            return null; // No hay un proveedor válido
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
