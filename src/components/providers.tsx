'use client';

import { useAppDispatch } from '@/hooks/redux.hook';
import { fetchCategories } from '@/redux/categorySlice';
import store from '@/redux/store';
import { SessionProvider } from 'next-auth/react';
import { Suspense, useEffect } from 'react';
import { Provider } from 'react-redux';

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
      <SessionProvider>
        <Suspense fallback={null}>
          {children}
        </Suspense>
      </SessionProvider>
    </Provider>
  );
};

export default Providers;
