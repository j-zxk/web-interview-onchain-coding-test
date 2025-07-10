const res = {
  ok: true,
  warning: '',
  wallet: [
    {
      currency: 'USDT',
      amount: 1245,
    },
    {
      currency: 'BTC',
      amount: 1.4,
    },
    {
      currency: 'ETH',
      amount: 20.3,
    },
    {
      currency: 'CRO',
      amount: 259.1,
    },
    {
      currency: 'DAI',
      amount: 854,
    },
  ],
};

export default function getWalletBalance(): Promise<any> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() > 0.05) {
        resolve(res);
      } else {
        reject(new Error('Failed to get balance'));
      }
    }, 1000);
  });
}
