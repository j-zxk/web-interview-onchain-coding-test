import React, { useEffect } from 'react';
import type { WalletModalProps } from '../types';
import { X, AlertCircle } from 'lucide-react';
import WalletButton from './WalletButton';

const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  wallets,
  onSelectWallet,
  connecting,
  error,
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 ease-in-out">
      <div
        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6 mx-auto transform transition-all duration-300 ease-in-out"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Connect Wallet
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            aria-label="Close"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 flex items-start">
            <AlertCircle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-sm">{error.message}</span>
          </div>
        )}

        {/* Wallet options */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {wallets.map((wallet) => (
            <WalletButton
              key={wallet.id}
              wallet={wallet}
              onClick={() => onSelectWallet(wallet.id)}
              disabled={connecting}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          By connecting your wallet, you agree to our Terms of Service and
          Privacy Policy
        </div>
      </div>
    </div>
  );
};

export default WalletModal;
