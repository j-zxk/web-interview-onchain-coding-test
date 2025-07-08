import { ethers } from 'ethers';
import type { Wallet } from '../types';

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (arg: any) => void) => void;
    };
  }
}

export const isMetaMaskInstalled = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    typeof window.ethereum !== 'undefined' &&
    window.ethereum.isMetaMask === true
  );
};

const connectMetaMask = async (): Promise<any> => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }

  try {
    const accounts = await window.ethereum?.request({
      method: 'eth_requestAccounts',
    });

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found');
    }

    const provider = new ethers.BrowserProvider(window.ethereum!);
    const singer = await provider.getSigner();
    const address = await singer.getAddress();
    const { chainId } = await provider.getNetwork();

    // 设置事件监听账号和链的切换
    window.ethereum?.on('accountsChanged', (newAccounts: string[]) => {
      if (newAccounts.length === 0) {
        // 断开连接
        window.dispatchEvent(new CustomEvent('wallet_disconnected'));
      } else {
        // 切换账户
        window.dispatchEvent(
          new CustomEvent('wallet_accountsChanged', {
            detail: { accounts: newAccounts },
          })
        );
      }
    });

    window.ethereum?.on('chainChanged', (chainIdHex: string) => {
      const newChainId = parseInt(chainIdHex, 16);
      window.dispatchEvent(
        new CustomEvent('wallet_chainChanged', {
          detail: { chainId: newChainId },
        })
      );
    });

    return {
      provider,
      singer,
      address,
      chainId,
    };
  } catch (error) {
    console.error('MetaMask connection error:', error);
    throw error;
  }
};

export const metaMaskWallet: Wallet = {
  id: 'metamask',
  name: 'MetaMask',
  icon: () => null,
  connector: connectMetaMask,
  description: 'Connect to your MetaMask Wallet',
  installed: isMetaMaskInstalled(),
  downloadUrl: 'https://metamask.io/download/',
};
