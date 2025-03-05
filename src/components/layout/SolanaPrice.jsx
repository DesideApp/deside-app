import React, { useEffect, useState, useRef, useMemo } from "react";
import "./SolanaPrice.css";
import { getSolanaPrice } from "../../utils/solanaHelpers.js";

const SolanaPrice = React.memo(() => {
    const [price, setPrice] = useState(0);
    const [prevPrice, setPrevPrice] = useState(0);
    const priceRef = useRef(0);
    
    useEffect(() => {
        const fetchPrice = async () => {
            const newPrice = await getSolanaPrice();
            if (typeof newPrice === "number") {
                setPrevPrice(priceRef.current); // Guardar el precio anterior
                priceRef.current = newPrice; // Actualizar referencia
                setPrice(newPrice);
            }
        };

        fetchPrice();
        const interval = setInterval(fetchPrice, 10000); // 🔄 Consultar cada 10s

        return () => clearInterval(interval);
    }, []);

    // ✅ Definir color basado en la comparación con el precio anterior
    const priceChange = useMemo(() => {
        if (price > prevPrice) return "up"; // Subió (verde)
        if (price < prevPrice) return "down"; // Bajó (rojo)
        return "neutral"; // Sin cambios
    }, [price, prevPrice]);

    return (
        <div className="solana-price-container">
            <span className={`solana-price ${priceChange}`}>
                ${price.toFixed(2)}
            </span>
        </div>
    );
});

export default SolanaPrice;
