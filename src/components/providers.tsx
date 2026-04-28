'use client';

import { useAppDispatch } from '@/hooks/redux.hook';
import { fetchCategories } from '@/redux/categorySlice';
import store from '@/redux/store';
import { SessionProvider } from 'next-auth/react';
import { Suspense, useEffect } from 'react';
import { Provider } from 'react-redux';
import { Toaster } from 'sonner';

const LoadReduxState = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  return <></>;
};

const Providers = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <Provider store={store}>
      <LoadReduxState />
      {/* Sonner Toaster */}
      <Toaster richColors />
      <SessionProvider>
        <Suspense fallback={null}>
          {children}
        </Suspense>
      </SessionProvider>
    </Provider>
  );
};

export default Providers;
