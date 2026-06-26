import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// Auth.js (NextAuth v5) — Google OAuth sign-in.
// Env vars (in .env.local): AUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true, // allow localhost / non-Vercel hosts in dev
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
});
