import { ethers } from 'ethers';

export const formatEther = (value: string | number, decimals = 4): string => {
  if (!value) return '0 ETH';

  const formatted = parseFloat(ethers.formatEther(value.toString()))
    .toFixed(decimals)
    .replace(/\.?0+$/, ''); // Remove trailing zeros

  return `${formatted} ETH`;
};

export const getNetworkName = (chainId: number): string => {
  const networks: Record<number, string> = {
    1: 'Ethereum',
    5: 'Goerli',
    11155111: 'Sepolia',
    137: 'Polygon',
    80001: 'Mumbai',
    42161: 'Arbitrum',
    10: 'Optimism',
    56: 'BSC',
    43114: 'Avalanche',
  };

  return networks[chainId] || `Chain ${chainId}`;
};

export const getStorageItem = <T>(key: string): T | null => {
  const item = localStorage.getItem(key);
  if (!item) return null;

  try {
    const { value, expiry } = JSON.parse(item);
    if (expiry && new Date().getTime() > expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return value as T;
  } catch (e) {
    return null;
  }
};

export const setStorageItem = <T>(
  key: string,
  value: T,
  expiryInHours?: number
): void => {
  const item = {
    value,
    expiry: expiryInHours
      ? new Date().getTime() + expiryInHours * 60 * 60 * 1000
      : null,
  };

  localStorage.setItem(key, JSON.stringify(item));
};
