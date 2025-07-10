import {
  render,
  fireEvent,
  screen,
  waitFor,
  renderHook,
} from '@testing-library/react';
// import { renderHook } from '@testing-library/react-hooks';
import { WalletProvider, useWallet } from '../wallet';
import type { Wallet, Chain, WalletProviderProps } from '../wallet/types';
import '@testing-library/jest-dom';

// Mock WalletModal
jest.mock('../wallet/components/WalletModal', () => ({
  __esModule: true,
  default: ({ isOpen }: any) =>
    isOpen ? <div data-testid="modal">Modal Open</div> : null,
}));

// Mock依赖
jest.mock('../wallet/utils', () => ({
  getStorageItem: jest.fn(),
  setStorageItem: jest.fn(),
}));
jest.mock('../services', () => ({
  getCurrencies: jest
    .fn()
    .mockResolvedValue({ currencies: [{ id: 'A', symbol: 'AA' }] }),
  getWalletBalance: jest
    .fn()
    .mockResolvedValue({ wallet: [{ asset: 'USDT', amount: 10 }] }),
  getLiveRates: jest
    .fn()
    .mockResolvedValue({ tiers: [{ id: 1, rates: [{ rate: 1.5 }] }] }),
}));
(global as any).window = Object.create(window);

describe('WalletProvider', () => {
  let consoleErrorMock: jest.SpyInstance;

  const mockConnect = jest.fn().mockResolvedValue({
    provider: {},
    address: '0x123',
    chainId: 1,
  });

  const mockWallets: Wallet[] = [
    {
      name: 'Metamask',
      icon: () => null,
      id: 'meta',
      connector: mockConnect,
    },
  ];

  const mockChains: Chain[] = [
    {
      id: 1,
      name: 'Ethereum',
      currency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
      rpcUrl: 'https://rpc-url',
      blockExplorer: { url: 'https://scan', name: 'Etherscan' },
    },
  ];

  function WalletConsumer() {
    const wallet = useWallet();
    return (
      <div>
        <button onClick={() => wallet.openModal()}>Open Modal</button>
        <button onClick={() => wallet.closeModal()}>Close Modal</button>
        <button onClick={() => wallet.connect('meta')}>Connect</button>
        <button onClick={wallet.disconnect}>Disconnect</button>
        <button onClick={() => wallet.switchChain(1)}>Switch Chain</button>
        {wallet.isConnected && <div>Connected: {wallet.address}</div>}
      </div>
    );
  }

  const Wrapper = (props?: Partial<WalletProviderProps>) => (
    <WalletProvider chains={mockChains} wallets={mockWallets} {...props}>
      <WalletConsumer />
    </WalletProvider>
  );

  beforeEach(() => {
    consoleErrorMock = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleErrorMock.mockRestore();
  });

  it('renders children', () => {
    render(<Wrapper />);
    expect(screen.getByText('Open Modal')).toBeInTheDocument();
  });

  it('should open and close modal', () => {
    render(<Wrapper />);
    fireEvent.click(screen.getByText('Open Modal'));
    expect(screen.getByTestId('modal')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Close Modal'));
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  it('calls connect and updates state', async () => {
    render(<Wrapper />);
    fireEvent.click(screen.getByText('Connect'));
    await waitFor(() => {
      expect(mockConnect).toHaveBeenCalled();
      expect(screen.getByText('Connected: 0x123')).toBeInTheDocument();
    });
  });

  it('calls disconnect and resets state', async () => {
    render(<Wrapper />);
    fireEvent.click(screen.getByText('Connect'));
    await waitFor(() =>
      expect(screen.getByText('Connected: 0x123')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByText('Disconnect'));
    expect(screen.queryByText('Connected: 0x123')).not.toBeInTheDocument();
  });

  it('calls switchChain', async () => {
    // mock window.ethereum
    (window as any).ethereum = {
      request: jest.fn().mockResolvedValue({}),
    };
    render(<Wrapper />);
    fireEvent.click(screen.getByText('Switch Chain'));
    await waitFor(() => {
      expect(window.ethereum?.request).toHaveBeenCalledWith({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x1' }],
      });
    });
  });

  it('autoConnects if localStorage has last connected wallet', async () => {
    const { getStorageItem } = await import('../wallet/utils');
    (getStorageItem as jest.Mock).mockReturnValue('meta');
    render(<Wrapper />);
    await waitFor(() => {
      expect(mockConnect).toHaveBeenCalled();
      expect(screen.getByText('Connected: 0x123')).toBeInTheDocument();
    });
  });

  it('handles error on connect', async () => {
    mockConnect.mockRejectedValueOnce(new Error('fail'));
    render(<Wrapper />);
    fireEvent.click(screen.getByText('Connect'));
    await waitFor(() => {
      expect(screen.queryByText('Connected: 0x123')).not.toBeInTheDocument();
    });
  });

  it('provides useWallet context', () => {
    expect(() => render(<Wrapper />)).not.toThrow();
  });

  it('throws error if useWallet used outside WalletProvider', async () => {
    try {
      renderHook(() => useWallet());
      throw new Error('Expected hook to throw, but it did not');
    } catch (err) {
      expect((err as Error).message).toBe(
        'useWallet must be used within a WalletProvider'
      );
    }
  });
});
