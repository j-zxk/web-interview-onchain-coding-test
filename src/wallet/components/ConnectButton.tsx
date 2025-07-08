import React, { useEffect, useState, useCallback } from 'react';
import { useWallet } from '../providers/WalletProvider';
import type { ConnectButtonProps } from '../types';
import { formatEther, getNetworkName } from '../utils';
import { Wallet, ChevronDown, Power, Globe } from 'lucide-react';

// 主ConnectButton组件
const ConnectButton: React.FC<ConnectButtonProps> = ({
  label = 'Connect Wallet',
  showBalance = true,
  className = '',
  onConnect,
  onDisconnect,
  onChainSwitch,
  onBalanceChange,
}) => {
  const {
    isConnected,
    isConnecting,
    address,
    chainId,
    openModal,
    disconnect,
    provider,
    switchChain,
    chains,
    error,
  } = useWallet();

  const [balance, setBalance] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // 余额获取
  const fetchBalance = useCallback(async () => {
    if (isConnected && address && provider) {
      try {
        const balanceBigInt = await provider.getBalance(address);
        const formattedBalance = formatEther(balanceBigInt);
        setBalance(formattedBalance);

        // 触发余额变化回调
        onBalanceChange?.(formattedBalance);
      } catch (error) {
        console.error('Failed to fetch balance:', error);
      }
    } else {
      setBalance(null);
    }
  }, [isConnected, address, provider, onBalanceChange]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // 连接成功回调
  useEffect(() => {
    if (isConnected && address && chainId && onConnect) {
      onConnect(address, chainId);
    }
  }, [isConnected, address, chainId, onConnect]);

  // 网络切换处理
  const handleChainSwitch = useCallback(
    async (newChainId: number) => {
      if (chainId !== newChainId) {
        const oldChainId = chainId;
        try {
          await switchChain(newChainId);

          // 触发链切换回调
          if (oldChainId && onChainSwitch) {
            onChainSwitch(oldChainId, newChainId);
          }
        } catch (error) {
          console.error('Failed to switch chain:', error);
        }
      }
      setIsDropdownOpen(false);
    },
    [chainId, switchChain, onChainSwitch]
  );

  // 断开连接处理
  const handleDisconnect = useCallback(async () => {
    await disconnect();
    onDisconnect?.();
  }, [disconnect, onDisconnect]);

  // 未连接状态
  if (!isConnected) {
    return (
      <button
        onClick={openModal}
        disabled={isConnecting}
        className={`
          flex items-center justify-center gap-2 
          bg-gradient-to-r from-blue-600 to-blue-700 
          hover:from-blue-700 hover:to-blue-800
          disabled:from-blue-400 disabled:to-blue-500 
          disabled:cursor-not-allowed
          text-white font-medium rounded-xl
          shadow-lg hover:shadow-xl
          border border-blue-500/20
          transition-all duration-300 ease-out
          transform hover:scale-[1.02] active:scale-[0.98]
          disabled:transform-none disabled:hover:scale-100
          text-base px-4 py-2
          ${className}
        `}
      >
        {isConnecting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            正在连接...
          </>
        ) : (
          <>
            <Wallet size={20} />
            {label}
          </>
        )}
      </button>
    );
  }

  // 已连接状态
  return (
    <div className="flex items-center gap-2 min-w-0 w-full">
      {/* 网络选择器 */}
      {chainId && (
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center 
              bg-white dark:bg-gray-800/80 
              border border-gray-300 dark:border-gray-600
              hover:bg-gray-50 dark:hover:bg-gray-700/80 
              hover:border-gray-400 dark:hover:border-gray-500
              text-gray-700 dark:text-gray-200
              rounded-xl px-3 py-1.5 
              shadow-md hover:shadow-lg
              transition-all duration-300 ease-out
              backdrop-blur-sm"
          >
            <Globe
              size={16}
              className="mr-2 text-blue-600 dark:text-blue-400 flex-shrink-0"
            />
            <span className="font-medium whitespace-nowrap">
              {getNetworkName(chainId)}
            </span>
            <ChevronDown
              size={16}
              className={`ml-2 text-gray-500 dark:text-gray-400 transform transition-transform duration-300 flex-shrink-0 ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isDropdownOpen && (
            <>
              {/* 遮罩层 */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsDropdownOpen(false)}
              />

              {/* 下拉菜单 */}
              <div
                className="absolute top-full left-0 mt-2 w-48 
                bg-white dark:bg-gray-800 
                rounded-xl shadow-xl 
                border border-gray-200 dark:border-gray-600
                backdrop-blur-lg bg-white/90 dark:bg-gray-800/90
                z-20 overflow-hidden"
              >
                {chains.map((chain) => (
                  <button
                    key={chain.id}
                    onClick={() => handleChainSwitch(chain.id)}
                    className={`w-full text-left px-4 py-3 
                      hover:bg-gray-100 dark:hover:bg-gray-700/80 
                      transition-all duration-200 ease-out
                      border-b border-gray-100 dark:border-gray-700 last:border-b-0
                      ${
                        chain.id === Number(chainId)
                          ? 'font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'text-gray-700 dark:text-gray-200'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{chain.name}</span>
                      {chain.id === Number(chainId) && (
                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-lg" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* 账户按钮 */}
      <button
        onClick={handleDisconnect}
        className={`
          flex items-center gap-2 min-w-0 flex-1
          bg-white dark:bg-gray-800/80 
          border border-gray-300 dark:border-gray-600
          hover:bg-gray-50 dark:hover:bg-gray-700/80
          hover:border-gray-400 dark:hover:border-gray-500
          text-gray-900 dark:text-white
          rounded-xl 
          shadow-md hover:shadow-lg
          transition-all duration-300 ease-out
          backdrop-blur-sm
          transform hover:scale-[1.02] active:scale-[0.98]
          text-base px-4 py-2
          ${className}
        `}
      >
        {showBalance && balance && (
          <span className="text-gray-600 dark:text-gray-300 text-sm font-medium bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg whitespace-nowrap flex-shrink-0">
            {balance}
          </span>
        )}
        <Power
          size={16}
          className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200 flex-shrink-0"
        />
      </button>

      {/* 错误提示 */}
      {error && (
        <div
          className="absolute top-full left-0 mt-2 p-3 
          bg-red-50 dark:bg-red-900/30 
          border border-red-200 dark:border-red-700 
          rounded-xl shadow-lg
          text-red-700 dark:text-red-300 
          text-sm max-w-xs
          backdrop-blur-sm z-30"
        >
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
            <span className="truncate">{error.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectButton;
