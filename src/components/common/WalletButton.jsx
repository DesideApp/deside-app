import React, { useState, useCallback, memo } from 'react';
import { detectWallet, handleWalletSelected, handleLogoutClick } from '../../services/walletStateService.js';
import WalletMenu from './WalletMenu';
import WalletModal from './WalletModal';
import './WalletButton.css';

const WalletButton = memo(() => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [walletState, setWalletState] = useState({
    pubkey: null,
    balance: null,
    status: 'disconnected', // Estados: disconnected, connecting, connected, error
  });

  // Actualiza el estado de la wallet
  const updateWalletState = useCallback(async () => {
    const { pubkey, balance, status } = await detectWallet();
    setWalletState({ pubkey, balance, status });
  }, []);

  // Maneja el clic en el botón principal
  const handleMainButtonClick = useCallback(() => {
    walletState.status === 'connected' ? setIsMenuOpen((prev) => !prev) : setIsModalOpen(true);
  }, [walletState.status]);

  // Conecta una wallet específica
  const connectWalletHandler = useCallback(
    async (walletType) => {
      setWalletState((prev) => ({ ...prev, status: 'connecting' }));
      const result = await handleWalletSelected(walletType);
      if (result.status === 'authenticated') {
        await updateWalletState();
        setIsModalOpen(false);
      }
    },
    [updateWalletState]
  );

  // Cierra la sesión de la wallet
  const logoutHandler = useCallback(async () => {
    await handleLogoutClick();
    setWalletState({ pubkey: null, balance: null, status: 'disconnected' });
    setIsMenuOpen(false);
  }, []);

  // Formatea el balance para mostrarlo en la UI
  const formattedBalance = walletState.status === 'connected'
    ? walletState.balance !== null
      ? `${walletState.balance.toFixed(2)} SOL`
      : '-- SOL'
    : 'Conectar Wallet';

  return (
    <div className="wallet-container">
      <button
        className={`wallet-button ${walletState.status}`}
        onClick={handleMainButtonClick}
        aria-label={walletState.status === 'connected' ? 'Ver menú de wallet' : 'Conectar wallet'}
      >
        {formattedBalance}
      </button>

      <WalletMenu
        isOpen={isMenuOpen}
        handleLogout={logoutHandler}
        onClose={() => setIsMenuOpen(false)}
        {...walletState}
      />

      <WalletModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onWalletSelected={connectWalletHandler}
      />
    </div>
  );
});

export default WalletButton;