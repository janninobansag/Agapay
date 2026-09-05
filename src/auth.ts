import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Facebook from "next-auth/providers/facebook";
import Google from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { UserRole, UserStatus } from "@prisma/client";
import { signInSchema } from "@/features/auth/schemas";
import { getPrisma } from "@/lib/db/prisma";

const standardSessionMaxAge = 60 * 60 * 24 * 7;
const rememberedSessionMaxAge = 60 * 60 * 24 * 30;

export const socialSignInProviders = {
  google: Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET),
  facebook: Boolean(process.env.AUTH_FACEBOOK_ID && process.env.AUTH_FACEBOOK_SECRET),
};

function createAuthConfig(sessionMaxAge: number): NextAuthConfig {
  return {
    secret: process.env.AUTH_SECRET,
    pages: {
      signIn: "/sign-in",
    },
    session: {
      strategy: "jwt",
      maxAge: sessionMaxAge,
    },
    providers: [
      Credentials({
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          const parsed = signInSchema.safeParse(credentials);
          if (!parsed.success) return null;

          const user = await getPrisma().user.findUnique({
            where: { email: parsed.data.email },
            select: {
              id: true,
              email: true,
              name: true,
              passwordHash: true,
              role: true,
              status: true,
            },
          });

          if (
            !user?.passwordHash ||
            user.status !== UserStatus.ACTIVE ||
            !(await compare(parsed.data.password, user.passwordHash))
          ) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        },
      }),
      ...(socialSignInProviders.google ? [Google] : []),
      ...(socialSignInProviders.facebook
        ? [Facebook({ authorization: { params: { scope: "email" } } })]
        : []),
    ],
    callbacks: {
      async signIn({ user, account }) {
        if (!account || account.provider === "credentials") return true;

        const email = user.email?.trim().toLowerCase();
        if (!email || !account.providerAccountId) return false;

        const databaseUser = await getPrisma().$transaction(async (transaction) => {
          const linkedAccount = await transaction.oAuthAccount.findUnique({
            where: {
              provider_providerAccountId: {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
              },
            },
            include: { user: true },
          });

          if (linkedAccount) return linkedAccount.user;

          const localUser = await transaction.user.upsert({
            where: { email },
            update: {},
            create: {
              email,
              name: user.name?.trim().slice(0, 100) || email.split("@")[0].slice(0, 100),
              role: UserRole.RESIDENT,
            },
          });

          const oauthAccount = await transaction.oAuthAccount.upsert({
            where: {
              provider_providerAccountId: {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
              },
            },
            create: {
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              userId: localUser.id,
            },
            update: {},
          });

          return transaction.user.findUniqueOrThrow({ where: { id: oauthAccount.userId } });
        });

        if (databaseUser.status !== UserStatus.ACTIVE) return false;

        user.id = databaseUser.id;
        user.role = databaseUser.role;
        return true;
      },
      jwt({ token, user }) {
        if (user) {
          token.userId = user.id;
          token.role = user.role;
        }
        return token;
      },
      session({ session, token }) {
        if (session.user) {
          session.user.id = typeof token.userId === "string" ? token.userId : token.sub ?? "";
          session.user.role = Object.values(UserRole).includes(token.role as UserRole)
            ? (token.role as UserRole)
            : UserRole.RESIDENT;
        }
        return session;
      },
      authorized({ auth: session, request }) {
        const path = request.nextUrl.pathname;
        const isSignedIn = Boolean(session?.user);
        const role = session?.user?.role;

        if ((path === "/sign-in" || path === "/sign-up") && isSignedIn) {
          return Response.redirect(new URL("/post-login", request.nextUrl));
        }

        if (path.startsWith("/admin")) return role === "ADMIN";
        if (path.startsWith("/staff")) return role === "STAFF" || role === "ADMIN";

        const requiresSession = [
          "/dashboard",
          "/reports",
          "/map",
          "/notifications",
          "/settings",
          "/post-login",
        ].some((prefix) => path === prefix || path.startsWith(`${prefix}/`));

        return requiresSession ? isSignedIn : true;
      },
    },
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth(createAuthConfig(standardSessionMaxAge));

export const { signIn: signInRemembered } = NextAuth(createAuthConfig(rememberedSessionMaxAge));
