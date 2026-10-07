import { getServerSession, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const normalizedEmail = credentials.email.trim().toLowerCase();

          const user = await prisma.user.findUnique({
            where: {
              email: normalizedEmail,
            },
          });

          if (!user || !user.passwordHash) {
            console.warn(`[AUTH] User not found for email: ${normalizedEmail}`);
            return null;
          }

          if (user.isActive === false) {
            console.warn(`[AUTH] Deactivated account login attempt: ${normalizedEmail}`);
            throw new Error("ACCOUNT_DEACTIVATED: Your account has been deactivated. Please contact the administrator.");
          }

          const passwordValid = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          );

          if (!passwordValid) {
            console.warn(`[AUTH] Invalid password attempt for: ${normalizedEmail}`);
            return null;
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            permissions: user.permissions || [],
          };
        } catch (error) {
          console.error("[AUTH] Error during authorize:", error);
          if (error instanceof Error && error.message.startsWith("ACCOUNT_DEACTIVATED")) {
            throw error;
          }
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.isActive = user.isActive;
        token.permissions = user.permissions;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.isActive = token.isActive !== false;
        session.user.permissions = (token.permissions as string[]) || [];
      }

      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret:
    process.env.NEXTAUTH_SECRET ||
    process.env.AUTH_SECRET ||
    "izazov-9-platform-secret-2026",
};

export const auth = () => getServerSession(authOptions);