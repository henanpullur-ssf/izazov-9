import { auth } from "@/auth";
import { redirect } from "next/navigation";

export type AllowedRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "COORDINATOR"
  | "VOLUNTEER"
  | "JUDGE"
  | "PARTICIPANT";

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireAuth(allowedRoles?: AllowedRole[]) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user.role as AllowedRole;
    // SUPER_ADMIN has access to all admin sections
    if (userRole === "SUPER_ADMIN") {
      return user;
    }
    if (!allowedRoles.includes(userRole)) {
      redirect("/admin?error=unauthorized");
    }
  }

  return user;
}
