'use client';

import { SessionProvider } from 'next-auth/react';

const Providers = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return <SessionProvider>{children}</SessionProvider>;
};

export default Providers;
