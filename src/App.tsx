// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import React from 'react';
import { WalletProvider, metaMaskWallet, ConnectButton } from './wallet';
import './App.css';

const chains = [
  {
    id: 137,
    name: 'Polygon',
    rpcUrl: 'https://polygon-rpc.com',
    currency: {
      name: 'Matic',
      symbol: 'MATIC',
      decimals: 18,
    },
    blockExplorer: {
      name: 'PolygonScan',
      url: 'https://polygonscan.com',
    },
  },
  {
    id: 11155111,
    name: 'Sepolia',
    rpcUrl: 'https://sepolia.infura.io/v3/d8ed0bd1de8242d998a1405b6932ab33',
    currency: {
      name: 'Sepolia Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorer: {
      name: 'Etherscan',
      url: 'https://sepolia.etherscan.io',
    },
  },
  {
    id: 56,
    name: 'BNB Smart Chain',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    currency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    blockExplorer: {
      name: 'BscScan',
      url: 'https://bscscan.com',
    },
  },
];

// Define supported wallets
const wallets = [metaMaskWallet];

function App() {
  return (
    <>
      <WalletProvider chains={chains} wallets={wallets}>
        <ConnectButton />
      </WalletProvider>
    </>
  );
}

export default App;
