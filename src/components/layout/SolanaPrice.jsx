import React, { useEffect, useState, useRef, useMemo } from "react";
import "./SolanaPrice.css";
import { getSolanaPrice } from "../../utils/solanaHelpers.js";

const SolanaPrice = React.memo(() => {
    const [price, setPrice] = useState(null); // 🔥 Inicia en null para mostrar "Loading..."
    const [prevPrice, setPrevPrice] = useState(null);
    const priceRef = useRef(null);
    const intervalRef = useRef(null);

    useEffect(() => {
        const fetchPrice = async () => {
            try {
                const newPrice = await getSolanaPrice();
                if (typeof newPrice === "number" && newPrice > 0) {
                    if (priceRef.current !== null) setPrevPrice(priceRef.current);
                    priceRef.current = newPrice;
                    setPrice(newPrice);
                }
            } catch (error) {
                console.warn("⚠️ Error obteniendo precio de Solana:", error);
                // ❌ NO actualizamos a 0 si falla la petición
            }
        };

        fetchPrice(); // 🔹 Llamada inicial

        if (!intervalRef.current) {
            intervalRef.current = setInterval(fetchPrice, 30000); // 🔥 Ahora cada 30s
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, []);

    // ✅ Definir el color de la animación basado en el precio anterior
    const priceChange = useMemo(() => {
        if (prevPrice === null || price === null) return "neutral";
        return price > prevPrice ? "up" : price < prevPrice ? "down" : "neutral";
    }, [price, prevPrice]);

    return (
        <div className="solana-price-container">
            <span className={`solana-price ${priceChange}`}>
                {price !== null ? `$${price.toFixed(2)}` : "Loading..."}
            </span>
        </div>
    );
});

export default SolanaPrice;
