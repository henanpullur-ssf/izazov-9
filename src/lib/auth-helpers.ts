import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  hasPermission,
  hasModuleAccess,
  isSuperAdmin,
  type UserAuthContext,
} from "@/lib/permissions";

export type AllowedRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "COORDINATOR"
  | "VOLUNTEER"
  | "JUDGE"
  | "PARTICIPANT";

/**
 * Retrieves the currently authenticated user from the session and syncs latest permissions from DB.
 */
export async function getCurrentUser(): Promise<UserAuthContext | null> {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  // Fetch up-to-date active status and permissions from DB
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        permissions: true,
      },
    });

    if (!dbUser || dbUser.isActive === false) {
      return null;
    }

    return {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
      isActive: dbUser.isActive,
      permissions: dbUser.permissions || [],
    };
  } catch (err) {
    console.error("[AUTH] Error syncing user from DB:", err);
    // Fallback to session user if DB read fails temporarily
    return {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role,
      isActive: session.user.isActive !== false,
      permissions: session.user.permissions || [],
    };
  }
}

/**
 * Enforces basic login. Redirects to /login if unauthenticated or inactive.
 */
export async function requireAuth(): Promise<UserAuthContext> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

/**
 * Enforces Super Admin access for protected server components.
 */
export async function requireSuperAdmin(): Promise<UserAuthContext> {
  const user = await requireAuth();

  if (!isSuperAdmin(user)) {
    redirect("/admin/access-denied?required=Super+Admin");
  }

  return user;
}

/**
 * Enforces module access for protected server components.
 */
export async function requireModule(moduleKey: string): Promise<UserAuthContext> {
  const user = await requireAuth();

  if (!hasModuleAccess(user, moduleKey)) {
    redirect(`/admin/access-denied?module=${encodeURIComponent(moduleKey)}`);
  }

  return user;
}

/**
 * Enforces granular permission for protected server components.
 */
export async function requirePermission(permissionKey: string): Promise<UserAuthContext> {
  const user = await requireAuth();

  if (!hasPermission(user, permissionKey)) {
    redirect(`/admin/access-denied?permission=${encodeURIComponent(permissionKey)}`);
  }

  return user;
}

/**
 * Server Action authorization guard for Super Admin.
 */
export async function assertSuperAdmin(): Promise<
  { success: true; user: UserAuthContext } | { success: false; error: string }
> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Authentication required. Please log in." };
  }
  if (!isSuperAdmin(user)) {
    return { success: false, error: "Access denied: Super Admin privileges required." };
  }
  return { success: true, user };
}

/**
 * Server Action authorization guard for granular permissions or module access.
 */
export async function assertPermission(permissionKey: string): Promise<
  { success: true; user: UserAuthContext } | { success: false; error: string }
> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Authentication required. Please log in." };
  }
  if (!hasPermission(user, permissionKey)) {
    return {
      success: false,
      error: `Access denied: You do not have '${permissionKey}' permission.`,
    };
  }
  return { success: true, user };
}
