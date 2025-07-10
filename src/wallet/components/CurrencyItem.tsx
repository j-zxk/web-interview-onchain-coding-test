import type React from 'react';
import { DefaultCurrencyIcon } from '../icons';
import type { CurrencyMerged } from '../types';
import { formatToCurrency } from '../utils';

interface CurrencyItemProps {
  currency: CurrencyMerged;
}

const CurrencyItem: React.FC<CurrencyItemProps> = ({ currency }) => {
  const { name, symbol, amount, to_currency, rates } = currency;

  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8">
          <DefaultCurrencyIcon />
        </div>
        <div className="font-medium">{name}</div>
      </div>
      <div className="text-right">
        <div className="text-sm text-gray-600">{`${
          amount || 0
        } ${symbol}`}</div>
        <div className="text-xs text-gray-500">
          {typeof amount === 'number' &&
            typeof to_currency === 'string' &&
            typeof rates?.[0]?.rate === 'string' &&
            formatToCurrency(amount, to_currency, rates[0].rate)}
        </div>
      </div>
    </div>
  );
};

export default CurrencyItem;
