import { ItemInCart } from '@/types/cart';

export const generateURL = (subdomain?: string) => {
  if (!subdomain) {
    return '/';
  }
  if (process.env.NODE_ENV === 'development') {
    return `/shops/${subdomain}`;
  }

  const domain = process.env.NEXT_PUBLIC_ROOT_DOMAIN!;

  if (!domain)
    throw new Error('NEXT_PUBLIC_ROOT_DOMAIN environmnet variable is reqiured');

  return `https://${subdomain}.${domain}`;
};

export const formatNumber = (number: number | string) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// const formatNumber = (num: number) => {
//     return new Intl.NumberFormat('en-US').format(num);
//   };

export const calculateCartTotal = (
  items: ItemInCart[],
) =>
  items.reduce((acc, curr) => {
    const amount =
      curr.productId.discount > 0
        ? curr.productId.price - ((curr.productId.discount / 100) * curr.productId.price)
        : curr.productId.price;
    return acc + curr.quantity * amount;
  }, 0) as number;

export const generateTrackingId = () =>
  Math.floor(100000000 * Math.random() * 9000000000);