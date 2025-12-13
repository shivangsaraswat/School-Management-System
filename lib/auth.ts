import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { Role } from "@/lib/constants";

export const { handlers, signIn, signOut, auth } = NextAuth({
    pages: {
        signIn: "/login",
        error: "/error",
    },
    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60, // 24 hours
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as Role;
            }
            return session;
        },
        async authorized({ auth, request }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = request.nextUrl.pathname.startsWith("/(dashboard)");
            const isOnAuth = request.nextUrl.pathname.startsWith("/login");

            if (isOnDashboard) {
                return isLoggedIn;
            } else if (isLoggedIn && isOnAuth) {
                // If there is an error (e.g. account_deleted), allow access to login page
                // so the user can see the error message
                if (request.nextUrl.searchParams.get("error")) {
                    return true;
                }
                return Response.redirect(new URL("/", request.nextUrl));
            }
            return true;
        },
    },
    providers: [
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const email = credentials.email as string;
                const password = credentials.password as string;

                const user = await db
                    .select()
                    .from(users)
                    .where(eq(users.email, email))
                    .limit(1);

                // User doesn't exist - return null (shows "Invalid credentials")
                // We don't reveal that the account was deleted for security
                if (!user.length) {
                    return null;
                }

                // User exists but is deactivated - throw specific error
                if (!user[0].isActive) {
                    throw new Error("account_deactivated");
                }

                const passwordMatch = await compare(password, user[0].password);

                if (!passwordMatch) {
                    return null;
                }

                return {
                    id: user[0].id,
                    email: user[0].email,
                    name: user[0].name,
                    role: user[0].role,
                };
            },
        }),
    ],
});
