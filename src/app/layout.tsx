import type { Metadata } from 'next';
import './global.css';
import Providers from '@/components/providers';

export const metadata: Metadata = {
  title: 'Shop Sphere',
  description: 'Store for everyone',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Providers>
        <body>{children}</body>
      </Providers>
    </html>
  );
}
