/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { UserAttributes } from '@/models/User';
import { Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface User extends UserAttributes {}

  interface Session {
    user: UserAttributes;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends UserAttributes {}
}
