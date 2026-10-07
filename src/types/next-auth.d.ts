import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: string;
    isActive?: boolean;
    permissions?: string[];
  }

  interface Session {
    user: {
      id: string;
      role: string;
      isActive?: boolean;
      permissions?: string[];
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    isActive?: boolean;
    permissions?: string[];
  }
}