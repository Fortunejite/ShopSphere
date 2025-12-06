import Credentials from 'next-auth/providers/credentials';
import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';
import { compare } from 'bcrypt';
import { loginUserSchema } from './lib/schema/auth';
import { User } from './models/User';

const config: NextAuthConfig = {
  pages: {
    signIn: '/login',
  },

  providers: [
    Credentials({
      credentials: {},

      authorize: async (credentials) => {
        // TODO: wrap with try catch block and use a universal error handler
        const { email, password } = loginUserSchema.parse(credentials);

        const user = await User.findByEmail(email);
        if (!user) {
          return null;
        }

        const isValid = await compare(password, user.password_hash);
        if (!isValid) return null;

        return user;
      },
    }),
  ],

  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = Number(user.id!);
        token.email = user.email;
        token.username = user.username;
        token.role = user.role;
        token.city = user.city;
        token.address = user.address;
        token.phone_number = user.phone_number;
      }
      return token;
    },

    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id;
        session.user.email = token.email || '';
        session.user.username = token.username;
        session.user.role = token.role;
        session.user.city = token.city;
        session.user.address = token.address;
        session.user.phone_number = token.phone_number;
      }

      return session;
    },
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth(config);
