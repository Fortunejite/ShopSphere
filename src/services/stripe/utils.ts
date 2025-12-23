export const toStripeAmount = (amount: number, currency: string): number => {
  const zeroDecimalCurrencies = [
    'BIF', 'CLP', 'DJF', 'GNF', 'JPY', 'KMF', 'KRW',
    'MGA', 'PYG', 'RWF', 'UGX', 'VND', 'VUV', 'XAF',
    'XOF', 'XPF'
  ];

  const threeDecimalCurrencies = [
    'BHD', 'IQD', 'JOD', 'KWD', 'LYD', 'OMR', 'TND'
  ];

  if (zeroDecimalCurrencies.includes(currency.toUpperCase())) {
    return Math.round(amount);
  } else if (threeDecimalCurrencies.includes(currency.toUpperCase())) {
    return Math.round(amount * 1000);
  } else {
    return Math.round(amount * 100);
  }
};