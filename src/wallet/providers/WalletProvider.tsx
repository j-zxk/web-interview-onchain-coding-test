import React, {
  useState,
  useEffect,
  useMemo,
  createContext,
  useContext,
  useCallback,
} from 'react';
import type {
  Wallet,
  WalletContextValue,
  WalletProviderProps,
  WalletState,
  Currency,
  Asset,
  ExchangeRate,
} from '../types';
import WalletModal from '../components/WalletModal';
import { getStorageItem, setStorageItem } from '../utils';
import { ethers } from 'ethers';
import { getCurrencies, getWalletBalance, getLiveRates } from '../../services';

const WalletContext = createContext<WalletContextValue>({
  address: null,
  chainId: null,
  isConnecting: false,
  isConnected: false,
  error: null,
  provider: null,
  connect: async () => {},
  disconnect: async () => {},
  switchChain: async () => {},
  openModal: () => {},
  closeModal: () => {},
  isModalOpen: false,
  chains: [],
  currencies: [],
  walletBalance: [],
  liveRates: [],
  dataStatus: 'idle',
});

export const WalletProvider: React.FC<WalletProviderProps> = ({
  children,
  chains,
  wallets,
  autoConnect = true,
}) => {
  const [state, setState] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnecting: false,
    isConnected: false,
    error: null,
    provider: null,
  });
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [walletBalance, setWalletBalance] = useState<Asset[]>([]);
  const [liveRates, setLiveRates] = useState<ExchangeRate[]>([]);
  const [dataStatus, setDataStatus] = useState<
    'idle' | 'loading' | 'empty' | 'success'
  >('idle');

  const walletsMap = useMemo(() => {
    return wallets.reduce((acc, wallet) => {
      acc[wallet.id] = wallet;
      return acc;
    }, {} as Record<string, Wallet>);
  }, [wallets]);

  useEffect(() => {
    const handleAccountsChanged = (
      event: CustomEvent<{ accounts: string[] }>
    ) => {
      const [newAddress] = event.detail.accounts;
      setState((prev) => ({
        ...prev,
        address: newAddress || null,
        isConnected: !!newAddress,
      }));
    };

    const handleChainChanged = (event: CustomEvent<{ chainId: number }>) => {
      setState((prev) => ({
        ...prev,
        chainId: event.detail.chainId,
        provider: new ethers.BrowserProvider(window.ethereum!),
      }));
    };

    const handleDisconnect = () => {
      setState({
        address: null,
        chainId: null,
        isConnecting: false,
        isConnected: false,
        error: null,
        provider: null,
      });
      localStorage.removeItem('lastConnectedWallet');
    };

    window.addEventListener(
      'wallet_accountsChanged',
      handleAccountsChanged as EventListener
    );
    window.addEventListener(
      'wallet_chainChanged',
      handleChainChanged as EventListener
    );
    window.addEventListener('wallet_disconnected', handleDisconnect);

    return () => {
      window.removeEventListener(
        'wallet_accountsChanged',
        handleAccountsChanged as EventListener
      );
      window.removeEventListener(
        'wallet_chainChanged',
        handleChainChanged as EventListener
      );
      window.removeEventListener('wallet_disconnected', handleDisconnect);
    };
  }, []);

  const connect = useCallback(
    async (walletId: string): Promise<void> => {
      try {
        const wallet = walletsMap[walletId];

        if (!wallet) {
          throw new Error(`Wallet with id "${walletId}" not found`);
        }

        setState((prev) => ({
          ...prev,
          isConnecting: true,
          error: null,
        }));

        const { provider, address, chainId } = await wallet.connector();

        setState({
          address,
          chainId,
          isConnecting: false,
          isConnected: true,
          error: null,
          provider,
        });
        setStorageItem('lastConnectedWallet', walletId, 24);
        setIsModalOpen(false);
      } catch (error) {
        console.error('Wallet connection error:', error);
        setState((prev) => ({
          ...prev,
          isConnecting: false,
          isConnected: false,
          error: error as Error,
        }));
      }
    },
    [walletsMap]
  );

  const disconnect = async () => {
    setState({
      address: null,
      chainId: null,
      isConnecting: false,
      isConnected: false,
      error: null,
      provider: null,
    });
  };

  const switchChain = useCallback(
    async (chainId: number): Promise<void> => {
      try {
        const targetChain = chains.find((chain) => chain.id === chainId);
        if (!targetChain) {
          throw new Error(`Chain with id "${chainId}" not supported`);
        }

        if (typeof window.ethereum !== 'undefined') {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: `0x${chainId.toString(16)}` }],
            });
          } catch (switchError: any) {
            // 如果链未添加到钱包中（错误码 4902）
            if (switchError.code === 4902) {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: `0x${chainId.toString(16)}`,
                    chainName: targetChain.name,
                    rpcUrls: [targetChain.rpcUrl],
                    nativeCurrency: targetChain.currency,
                    blockExplorerUrls: targetChain.blockExplorer
                      ? [targetChain.blockExplorer.url]
                      : undefined,
                  },
                ],
              });
            } else {
              throw switchError;
            }
          }

          setState((prev) => ({ ...prev, chainId }));
        } else {
          throw new Error('No ethereum provider found');
        }
      } catch (error) {
        console.error('Error switching chain:', error);
        setState((prev) => ({ ...prev, error: error as Error }));
      }
    },
    [chains]
  );

  useEffect(() => {
    if (autoConnect) {
      const lastConnectedWallet = getStorageItem<string>('lastConnectedWallet');
      if (lastConnectedWallet && walletsMap[lastConnectedWallet]) {
        connect(lastConnectedWallet).catch(console.error);
      }
    }
  }, [autoConnect, walletsMap, connect]);

  useEffect(() => {
    if (state.provider !== null) {
      setDataStatus('loading');
      Promise.all([getCurrencies(), getWalletBalance(), getLiveRates()])
        .then((res) => {
          setDataStatus('success');
          setCurrencies(res[0].currencies);
          setWalletBalance(res[1].wallet);
          setLiveRates(res[2].tiers);
        })
        .catch((error) => {
          setDataStatus('empty');
          console.error('failed to get currencies', error);
          throw error;
        });
    }
  }, [state]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const value: WalletContextValue = {
    ...state,
    connect,
    disconnect,
    switchChain,
    openModal,
    closeModal,
    isModalOpen: false,
    chains,
    currencies,
    walletBalance,
    liveRates,
    dataStatus,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
      <WalletModal
        isOpen={isModalOpen}
        onClose={closeModal}
        wallets={wallets}
        onSelectWallet={connect}
        connecting={state.isConnecting}
        error={state.error}
      />
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextValue => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
