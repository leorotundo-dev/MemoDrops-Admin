import type { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "https://api.memodrops.com";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: { email: { label: "Email", type: "text" }, password: { label: "Senha", type: "password" } },
      async authorize(credentials) {
        const res = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: credentials?.email, password: credentials?.password })
        });
        if (!res.ok) return null;
        const data = await res.json();
        // Expect { user: {id,email,name,role}, token }
        return { ...data.user, token: data.token } as unknown as User;
      }
    })
  ],
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = user;
        token.token = (user as any).token;
        token.role = (user as any).role || "admin";
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).user = token.user;
      (session as any).token = token.token;
      (session as any).role = token.role;
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET
};
