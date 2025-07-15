import React, { useEffect, useState, useRef, useMemo } from "react";
import "./SolanaPrice.css";
import { getSolanaPrice } from "../../utils/solanaHelpers.js";

const SolanaPrice = React.memo(() => {
    const [price, setPrice] = useState(null);
    const [prevPrice, setPrevPrice] = useState(null);
    const [currentClass, setCurrentClass] = useState("neutral"); // 🔥 Manejo del color temporal
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
            }
        };

        fetchPrice();

        if (!intervalRef.current) {
            intervalRef.current = setInterval(fetchPrice, 30000);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (prevPrice === null || price === null) {
            setCurrentClass("neutral");
            return;
        }

        const newClass = price > prevPrice ? "up" : price < prevPrice ? "down" : "neutral";
        setCurrentClass(newClass);

        // 🔥 Vuelve a neutral inmediatamente después de la animación
        setTimeout(() => setCurrentClass("neutral"), 500);
    }, [price, prevPrice]);

    return (
        <div className="solana-price-container">
            <span className={`solana-price ${currentClass}`}>
                {price !== null ? `$${price.toFixed(2)}` : "Connecting..."}
            </span>
        </div>
    );
});

export default SolanaPrice;
