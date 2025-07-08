export interface Wallet {
  id: string;
  name: string;
  icon: React.FC;
  connector: () => Promise<any>;
  description?: string;
  installed?: boolean;
  downloadUrl?: string;
}

export interface Chain {
  id: number;
  name: string;
  rpcUrl: string;
  currency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockExplorer?: {
    name: string;
    url: string;
  };
}

export interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnecting: boolean;
  isConnected: boolean;
  error: Error | null;
  provider: any;
}

export interface WalletContextValue extends WalletState {
  connect: (walletId: string) => Promise<void>;
  disconnect: () => Promise<void>;
  switchChain: (chainId: number) => Promise<void>;
  openModal: () => void;
  closeModal: () => void;
  isModalOpen: boolean;
  chains: Chain[];
}

export interface WalletProviderProps {
  children: React.ReactNode;
  chains: Chain[];
  wallets: Wallet[];
  autoConnect?: boolean;
}

export interface ConnectButtonProps {
  label?: string;
  showBalance?: boolean;
  className?: string;
  onConnect?: (address: string, chainId: number) => void;
  onDisconnect?: () => void;
  onChainSwitch?: (fromChainId: number, toChainId: number) => void;
  onBalanceChange?: (balance: string) => void;
}

export interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: Wallet[];
  onSelectWallet: (walletId: string) => Promise<void>;
  connecting: boolean;
  error: Error | null;
}
