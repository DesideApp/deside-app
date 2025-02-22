import { useWallet } from "../contexts/WalletContext.jsx"; // Importamos el contexto global
import { removeToken, renewJWT } from "./tokenService";
import { authenticateWallet } from "./walletAuthService";

// 📌 **Definimos los 6 posibles estados de la wallet y JWT**
const STATES = {
    STATE_1: "NO Y NO",
    STATE_2: "NO Y SI",
    STATE_3: "CONECTADO Y NO",
    STATE_4: "CONECTADO Y SI",
    STATE_5: "AUTENTICADO Y NO",
    STATE_6: "AUTENTICADO Y SI"
};

// 📌 **Definimos las acciones exactas a tomar según el estado**
const STATE_ACTIONS = {
    [STATES.STATE_1]: ["OPEN_MODAL"], // 🔵 Abrir modal de conexión
    [STATES.STATE_2]: ["EXPIRE_JWT", "OPEN_MODAL"], // ❌ Expirar JWT y abrir modal
    [STATES.STATE_3]: ["SIGN_AND_NEW_JWT"], // 🔄 Firmar y obtener nuevo JWT
    [STATES.STATE_4]: ["EXPIRE_JWT", "SIGN_AND_NEW_JWT"], // ❌ Expirar JWT → Firmar
    [STATES.STATE_5]: ["RENEW_JWT"], // 🔄 Renovar JWT
    [STATES.STATE_6]: ["NO_ACTION"] // ✅ Todo correcto, no hacer nada
};

// 🔥 **Función para determinar el estado actual usando `WalletContext`**
function determineWalletState() {
    const { jwt, walletAddress, walletStatus } = useWallet(); // 🚀 Ahora usa `WalletContext`

    if (!walletAddress && !jwt) return { state: STATES.STATE_1, actions: STATE_ACTIONS[STATES.STATE_1] };
    if (!walletAddress && jwt) return { state: STATES.STATE_2, actions: STATE_ACTIONS[STATES.STATE_2] };
    if (walletStatus === "connected" && !jwt) return { state: STATES.STATE_3, actions: STATE_ACTIONS[STATES.STATE_3] };
    if (walletStatus === "connected" && jwt) return { state: STATES.STATE_4, actions: STATE_ACTIONS[STATES.STATE_4] };
    if (walletStatus === "authenticated" && !jwt) return { state: STATES.STATE_5, actions: STATE_ACTIONS[STATES.STATE_5] };
    if (walletStatus === "authenticated" && jwt) return { state: STATES.STATE_6, actions: STATE_ACTIONS[STATES.STATE_6] };
}

// 🔥 **Función para ejecutar las acciones en orden exacto**
async function executeWalletAction({ actions }) {
    for (const action of actions) {
        switch (action) {
            case "OPEN_MODAL":
                console.log("🛑 No wallet y no JWT -> Abrir modal de conexión.");
                window.dispatchEvent(new Event("openWalletModal"));
                break;
            case "SIGN_AND_NEW_JWT":
                console.log("🖊 Solicitar firma y generar nuevo JWT.");
                await authenticateWallet();
                break;
            case "EXPIRE_JWT":
                console.log("❌ Eliminando JWT...");
                removeToken();
                break;
            case "RENEW_JWT":
                console.log("🔄 Intentando renovar JWT...");
                try {
                    await renewJWT();
                    console.log("✅ JWT renovado con éxito.");
                } catch (error) {
                    console.error("❌ No se pudo renovar el JWT, requiriendo autenticación.");
                    console.log("🔁 Ejecutando `SIGN_AND_NEW_JWT`...");
                    await authenticateWallet();
                }
                break;
            case "NO_ACTION":
            default:
                console.log("✅ No acción necesaria.");
                break;
        }
    }
}

// 🔥 **Función principal para garantizar el estado de la wallet**
async function ensureWalletState() {
    const stateData = determineWalletState(); // 🚀 Ahora usa estados globales
    await executeWalletAction(stateData);
    return stateData.state;
}

export { ensureWalletState };
