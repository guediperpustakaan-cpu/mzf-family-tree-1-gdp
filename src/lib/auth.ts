import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma, withRetry } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Sila masukkan email dan kata laluan.");
        }
        const user = await withRetry(() =>
          prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase() },
          })
        );
        if (!user) throw new Error("Email tidak dijumpai.");
        const ok = await bcrypt.compare(credentials.password, user.password);
        if (!ok) throw new Error("Kata laluan tidak sah.");
        return { id: user.id, email: user.email, name: user.name, role: user.role } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
