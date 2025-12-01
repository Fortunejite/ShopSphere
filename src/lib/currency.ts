export const currencySymbols: Record<string, string> = {
  NGN: '₦',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CNY: '¥', 
  INR: '₹',
  AUD: 'A$',
  CAD: 'C$',
  ZAR: 'R',
  RUB: '₽',
  BRL: 'R$',
  MXN: '$',
  KRW: '₩',
  IDR: 'Rp',
  TRY: '₺',
  ARS: '$',
  CLP: '$',
};

export const currencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
];

export const getCurrencySymbol = (currency: string): string => {
  return currencySymbols[currency] || currency;
};

export const formatCurrency = (
  amount: number | string,
  currency: string = 'NGN',
): string => {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${Number(amount).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  // return new Intl.NumberFormat('en-US', {
  //     style: 'currency',
  //     currency,
  //   }).format(Number(amount));
};