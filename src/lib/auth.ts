import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

async function recordLoginAudit(
  email: string,
  success: boolean,
  userId?: string,
  failReason?: string,
) {
  try {
    const hdrs = await headers();
    const ipAddress =
      hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? hdrs.get("x-real-ip") ?? null;
    const userAgent = hdrs.get("user-agent") ?? null;

    await db.loginAudit.create({
      data: { email, success, userId, failReason, ipAddress, userAgent },
    });

    logger.info("login_audit", {
      email,
      success,
      userId,
      ipAddress,
    });
  } catch (err) {
    logger.error("login_audit_write_failed", {
      email,
      error: err instanceof Error ? err.message : "unknown",
    });
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = (credentials.email as string).toLowerCase().trim();
        const password = credentials.password as string;

        const user = await db.user.findUnique({ where: { email } });
        if (!user) {
          await recordLoginAudit(email, false, undefined, "user_not_found");
          return null;
        }

        const valid = await compare(password, user.passwordHash);
        if (!valid) {
          await recordLoginAudit(email, false, user.id, "invalid_password");
          return null;
        }

        await recordLoginAudit(email, true, user.id);
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
