export const signMessage = async (message) => {
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
};
