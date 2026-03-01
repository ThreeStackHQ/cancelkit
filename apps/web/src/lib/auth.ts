// @ts-nocheck
import NextAuth, { type NextAuthConfig } from "next-auth";
import type { Session } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db, users, eq } from "@cancelkit/db";

const config: NextAuthConfig = {
  adapter: DrizzleAdapter(db),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    GitHub({
      clientId: process.env["GITHUB_CLIENT_ID"] ?? "",
      clientSecret: process.env["GITHUB_CLIENT_SECRET"] ?? "",
    }),
    Google({
      clientId: process.env["GOOGLE_CLIENT_ID"] ?? "",
      clientSecret: process.env["GOOGLE_CLIENT_SECRET"] ?? "",
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token["userId"] = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token["userId"] && typeof token["userId"] === "string") {
        (session as Session & { user: { id: string } }).user.id =
          token["userId"] as string;
      }
      return session;
    },
    async signIn({ user }) {
      if (!user.email) return false;

      // Upsert user on first OAuth sign-in
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, user.email))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(users).values({
          email: user.email,
          name: user.name ?? null,
          image: user.image ?? null,
        });
      }

      return true;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
};

const nextAuth = NextAuth(config);

export const handlers = nextAuth.handlers as typeof nextAuth.handlers;
export const auth = nextAuth.auth as typeof nextAuth.auth;
export const signIn = nextAuth.signIn as typeof nextAuth.signIn;
export const signOut = nextAuth.signOut as typeof nextAuth.signOut;
