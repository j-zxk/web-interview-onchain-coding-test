import { useWallet } from '../providers/WalletProvider';
import CurrencyItem from './CurrencyItem';
import { useMemo } from 'react';
import type { Currency, CurrencyMerged } from '../types';

const CurrenciesList: React.FC = () => {
  const { currencies, walletBalance, liveRates, dataStatus } = useWallet();

  const balanceMap = useMemo(
    () => new Map(walletBalance.map((b) => [b.currency, b])),
    [walletBalance]
  );
  const rateMap = useMemo(
    () => new Map(liveRates.map((r) => [r.from_currency, r])),
    [liveRates]
  );

  const currenciesMarged: CurrencyMerged[] = currencies.map(
    (currency: Currency) => {
      const coinId = currency.coin_id;
      const balance = balanceMap.get(coinId) || {};
      const rateInfo = rateMap.get(coinId) || {};

      return {
        ...currency,
        ...balance,
        ...rateInfo,
      };
    }
  );

  if (dataStatus === 'loading') {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="flex flex-col items-center space-y-4">
          <svg
            className="w-8 h-8 animate-spin text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
          <p className="text-sm text-gray-500">资产加载中，请稍候...</p>
        </div>
      </div>
    );
  }

  if (dataStatus === 'empty' && currenciesMarged.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow text-center py-12 px-6">
          <div className="flex justify-center mb-4">
            <svg
              className="w-12 h-12 text-gray-300"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-gray-600 text-lg font-medium">暂无资产</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl divide-y divide-gray-200 text-black">
      {currenciesMarged.map((currencyMerged: CurrencyMerged | Currency) => {
        return (
          <CurrencyItem
            key={currencyMerged.coin_id}
            currency={currencyMerged}
          />
        );
      })}
    </div>
  );
};

export default CurrenciesList;
