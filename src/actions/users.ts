"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { assertSuperAdmin } from "@/lib/auth-helpers";
import { UserRole } from "@/lib/constants";
import { getPermissionsForModules } from "@/lib/permissions";

export async function getStaffUsers(search?: string) {
  const authCheck = await assertSuperAdmin();
  if (!authCheck.success) {
    return { success: false, error: authCheck.error };
  }

  try {
    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        permissions: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            checkedAttendance: true,
            volunteerTasks: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: users };
  } catch (error) {
    console.error("Failed to fetch staff users:", error);
    return { success: false, error: "Failed to fetch staff users" };
  }
}

export async function createStaffUser(data: {
  name: string;
  email: string;
  password: string;
  role?: string;
  isActive?: boolean;
  moduleKeys?: string[];
  permissions?: string[];
}) {
  const authCheck = await assertSuperAdmin();
  if (!authCheck.success) {
    return { success: false, error: authCheck.error };
  }

  try {
    const normalizedEmail = data.email.trim().toLowerCase();
    if (!normalizedEmail || !data.name.trim()) {
      return { success: false, error: "Full Name and Email are required." };
    }

    if (!data.password || data.password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters long." };
    }

    // Check email uniqueness
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return { success: false, error: "An account with this email address already exists." };
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    // Compute permissions from module keys if provided
    let finalPermissions: string[] = data.permissions || [];
    if (data.moduleKeys && data.moduleKeys.length > 0) {
      finalPermissions = getPermissionsForModules(data.moduleKeys);
    }

    // Default role is VOLUNTEER (Staff / Volunteer)
    const roleValue = (data.role as UserRole) || UserRole.VOLUNTEER;

    const newUser = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: roleValue,
        isActive: data.isActive !== undefined ? data.isActive : true,
        permissions: finalPermissions,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        permissions: true,
        createdAt: true,
      },
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin");

    return { success: true, data: newUser };
  } catch (error) {
    console.error("Failed to create staff user:", error);
    return { success: false, error: "Failed to create staff account" };
  }
}

export async function updateStaffUser(
  id: string,
  data: {
    name?: string;
    email?: string;
    role?: string;
    isActive?: boolean;
    moduleKeys?: string[];
    permissions?: string[];
    newPassword?: string;
  }
) {
  const authCheck = await assertSuperAdmin();
  if (!authCheck.success) {
    return { success: false, error: authCheck.error };
  }

  try {
    const userToUpdate = await prisma.user.findUnique({
      where: { id },
    });

    if (!userToUpdate) {
      return { success: false, error: "User account not found." };
    }

    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) {
      updateData.name = data.name.trim();
    }

    if (data.email !== undefined) {
      const normalizedEmail = data.email.trim().toLowerCase();
      if (normalizedEmail !== userToUpdate.email) {
        const existing = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });
        if (existing && existing.id !== id) {
          return { success: false, error: "Email is already in use by another account." };
        }
        updateData.email = normalizedEmail;
      }
    }

    if (data.role !== undefined) {
      updateData.role = data.role as UserRole;
    }

    if (data.isActive !== undefined) {
      // Prevent self-deactivation if caller is this user
      if (authCheck.user.id === id && data.isActive === false) {
        return { success: false, error: "You cannot deactivate your own Super Admin account." };
      }
      updateData.isActive = data.isActive;
    }

    if (data.moduleKeys !== undefined) {
      updateData.permissions = getPermissionsForModules(data.moduleKeys);
    } else if (data.permissions !== undefined) {
      updateData.permissions = data.permissions;
    }

    if (data.newPassword && data.newPassword.trim().length >= 6) {
      updateData.passwordHash = await bcrypt.hash(data.newPassword.trim(), 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        permissions: true,
        updatedAt: true,
      },
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin");

    return { success: true, data: updatedUser };
  } catch (error) {
    console.error("Failed to update staff user:", error);
    return { success: false, error: "Failed to update staff account" };
  }
}

export async function toggleStaffStatus(id: string, isActive: boolean) {
  const authCheck = await assertSuperAdmin();
  if (!authCheck.success) {
    return { success: false, error: authCheck.error };
  }

  if (authCheck.user.id === id && !isActive) {
    return { success: false, error: "You cannot deactivate your own account." };
  }

  try {
    const updated = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: { id: true, email: true, isActive: true },
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin");

    return { success: true, data: updated };
  } catch (error) {
    console.error("Failed to toggle staff status:", error);
    return { success: false, error: "Failed to update account status" };
  }
}

export async function resetStaffPassword(id: string, newPassword: string) {
  const authCheck = await assertSuperAdmin();
  if (!authCheck.success) {
    return { success: false, error: authCheck.error };
  }

  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: "Password must be at least 6 characters." };
  }

  try {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id },
      data: { passwordHash },
    });

    revalidatePath("/admin/users");

    return { success: true };
  } catch (error) {
    console.error("Failed to reset password:", error);
    return { success: false, error: "Failed to reset password" };
  }
}

export async function deleteStaffUser(id: string) {
  const authCheck = await assertSuperAdmin();
  if (!authCheck.success) {
    return { success: false, error: authCheck.error };
  }

  if (authCheck.user.id === id) {
    return { success: false, error: "You cannot delete your own Super Admin account." };
  }

  try {
    const target = await prisma.user.findUnique({
      where: { id },
      select: { role: true },
    });

    if (target?.role === "SUPER_ADMIN") {
      return { success: false, error: "Super Admin accounts cannot be deleted directly." };
    }

    await prisma.user.delete({
      where: { id },
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete staff user:", error);
    return { success: false, error: "Failed to delete staff account" };
  }
}
