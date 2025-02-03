import React from 'react';
import WalletButton from './WalletButton';

const AnotherComponent = () => {
  return (
    <div>
      <h2>Another Component</h2>
      <WalletButton /> {/* Otra instancia de WalletButton */}
    </div>
  );
};

export default AnotherComponent;
