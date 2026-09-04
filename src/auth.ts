import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { UserRole, UserStatus } from "@prisma/client";
import { signInSchema } from "@/features/auth/schemas";
import { getPrisma } from "@/lib/db/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7,
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
  ],
  callbacks: {
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
});
