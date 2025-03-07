import React, { useEffect, useState, useRef, useMemo } from "react";
import "./SolanaPrice.css";
import { getSolanaPrice } from "../../utils/solanaHelpers.js";

const SolanaPrice = React.memo(() => {
    const [price, setPrice] = useState(null);
    const [prevPrice, setPrevPrice] = useState(null);
    const priceRef = useRef(null);
    const intervalRef = useRef(null);

    useEffect(() => {
        const fetchPrice = async () => {
            const newPrice = await getSolanaPrice();
            if (typeof newPrice === "number" && newPrice > 0) {
                if (priceRef.current !== null) setPrevPrice(priceRef.current);
                priceRef.current = newPrice;
                setPrice(newPrice);
            }
        };

        fetchPrice(); // 🔹 Llamada inicial

        if (!intervalRef.current) { // ✅ Asegura que solo haya un intervalo activo
            intervalRef.current = setInterval(fetchPrice, 30000);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, []);

    // ✅ Cambio de color cuando el precio sube/baja
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
