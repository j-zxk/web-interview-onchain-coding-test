import {
  WalletProvider,
  metaMaskWallet,
  ConnectButton,
  CurrenciesList,
} from './wallet';
import './App.css';

const chains = [
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
    id: 25,
    name: 'Cronos',
    rpcUrl: 'https://evm.cronos.org',
    currency: {
      name: 'Cronos',
      symbol: 'CRO',
      decimals: 18,
    },
    blockExplorer: {
      name: 'Cronos Explorer',
      url: 'https://cronoscan.com',
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
        <CurrenciesList />
      </WalletProvider>
    </>
  );
}

export default App;
