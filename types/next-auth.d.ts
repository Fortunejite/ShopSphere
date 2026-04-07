/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { User as UserType } from '@prisma/client';
import { Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface User extends UserType {}

  interface Session {
    user: UserType;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends UserType {}
}
