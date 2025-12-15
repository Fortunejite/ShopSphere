'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

const AuthGuard = ({ reversed = false }) => {
  const { data, status } = useSession();
  if (reversed && data?.user) {
    return redirect('/');
  } else if (!data?.user && status !== 'loading') {
    return redirect('/login');
  }
  return null;
};

export default AuthGuard;
