import React from "react";
import "./BottomBar.css";
import NetworkStatus from "./NetworkStatus.jsx";
import SolanaPrice from "./SolanaPrice.jsx";

const BottomBar = React.memo(() => {
    return (
        <footer className="bottom-bar">
            <div className="network-info">
                <NetworkStatus className="network-status" />
                <SolanaPrice className="solana-price" />
            </div>
        </footer>
    );
});

export default BottomBar;
