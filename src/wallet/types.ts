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

export interface Currency {
  coin_id: string;
  name: string;
  symbol: string;
}

export interface Asset {
  currency: string;
  amount: number;
}

export interface Rate {
  amount: string;
  rate: string;
}

export interface ExchangeRate {
  from_currency: string;
  to_currency: string;
  rates: Rate[];
  time_stamp: number;
}

export interface CurrencyMerged extends Currency {
  currency?: string;
  amount?: number;
  from_currency?: string;
  to_currency?: string;
  rates?: Rate[];
  time_stamp?: number;
}

export interface WalletContextValue extends WalletState {
  connect: (walletId: string) => Promise<void>;
  disconnect: () => Promise<void>;
  switchChain: (chainId: number) => Promise<void>;
  openModal: () => void;
  closeModal: () => void;
  isModalOpen: boolean;
  chains: Chain[];
  currencies: Currency[];
  walletBalance: Asset[];
  liveRates: ExchangeRate[];
  dataStatus: 'idle' | 'loading' | 'empty' | 'success';
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
