import { ethers } from 'ethers';

export const formatEther = (
  value: string | number,
  symbol = 'ETH',
  decimals = 4
): string => {
  if (!value) return `0 ${symbol}`;

  const formatted = parseFloat(ethers.formatEther(value.toString()))
    .toFixed(decimals)
    .replace(/\.?0+$/, ''); // Remove trailing zeros

  return `${formatted} ${symbol}`;
};

export const formatToCurrency = (
  value: number,
  to_currency: string,
  rate: string
): string => {
  if (!value) return `0 ${to_currency}`;

  const formatted = (value * parseFloat(rate)).toFixed(2).replace(/\.?0+$/, '');

  return `${formatted} ${to_currency}`;
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
