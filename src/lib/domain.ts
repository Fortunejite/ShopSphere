const HOST = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'example.com';
const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';

export const generateURL = (shopDomain: string): string => {
  return `${protocol}://${shopDomain}.${HOST}`;
};
