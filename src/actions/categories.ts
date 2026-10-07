"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth-helpers";

export interface CategoryData {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  eventCount?: number;
}

const DEFAULT_CATEGORIES_DATA = [
  {
    name: "Technical",
    description: "Coding, Hackathons, Web3, AI Challenges & Robotics",
    color: "#3b82f6",
    sortOrder: 1,
  },
  {
    name: "Cultural",
    description: "Group Dance, Battle of Bands, Music & Theatrical Spectacles",
    color: "#ec4899",
    sortOrder: 2,
  },
  {
    name: "Literary",
    description: "Parliamentary Debate, Quizzing, Creative Writing & Elocution",
    color: "#8b5cf6",
    sortOrder: 3,
  },
  {
    name: "Arts & Design",
    description: "Fine Arts, Digital Illustration, UI/UX & Photography",
    color: "#f59e0b",
    sortOrder: 4,
  },
  {
    name: "Gaming & Esports",
    description: "LAN Battles, Valorant, BGMI & Tactical Esports Arenas",
    color: "#10b981",
    sortOrder: 5,
  },
  {
    name: "Management",
    description: "Case Study Marathons, Best Manager & Startup Pitching",
    color: "#6366f1",
    sortOrder: 6,
  },
  {
    name: "Sports",
    description: "Athletics, Table Tennis, Chess & Inter-House Tournaments",
    color: "#ef4444",
    sortOrder: 7,
  },
  {
    name: "Workshops",
    description: "Hands-on Masterclasses, Tech Demos & Expert Keynotes",
    color: "#06b6d4",
    sortOrder: 8,
  },
];

export async function ensureDefaultCategories() {
  try {
    const count = await prisma.category.count();
    if (count === 0) {
      // Seed default categories
      for (const cat of DEFAULT_CATEGORIES_DATA) {
        await prisma.category.create({
          data: {
            name: cat.name,
            description: cat.description,
            color: cat.color,
            sortOrder: cat.sortOrder,
            isActive: true,
          },
        });
      }

      // Check if existing events have categories not yet in default list
      const distinctEvents = await prisma.event.findMany({
        where: { category: { not: null } },
        select: { category: true },
        distinct: ["category"],
      });

      let nextOrder = DEFAULT_CATEGORIES_DATA.length + 1;
      for (const evt of distinctEvents) {
        if (!evt.category) continue;
        const exists = await prisma.category.findUnique({
          where: { name: evt.category },
        });
        if (!exists) {
          await prisma.category.create({
            data: {
              name: evt.category,
              description: `Imported event category`,
              color: "#931827",
              sortOrder: nextOrder++,
              isActive: true,
            },
          });
        }
      }
    }
  } catch (error) {
    console.warn("Could not ensure default categories:", error);
  }
}

export async function getCategories(includeInactive: boolean = false): Promise<{
  success: boolean;
  data: CategoryData[];
  error?: string;
}> {
  try {
    await ensureDefaultCategories();

    const where = includeInactive ? {} : { isActive: true };

    const categories = await prisma.category.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    // Count events per category name
    const groupedEvents = await prisma.event.groupBy({
      by: ["category"],
      _count: { id: true },
      where: { category: { not: null } },
    });

    const countsMap = new Map<string, number>();
    for (const g of groupedEvents) {
      if (g.category) {
        countsMap.set(g.category, g._count.id);
      }
    }

    const categoriesWithCount = categories.map((cat) => ({
      ...cat,
      eventCount: countsMap.get(cat.name) || 0,
    }));

    return { success: true, data: categoriesWithCount };
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return { success: false, data: [], error: "Failed to fetch categories" };
  }
}

export async function getCategoryById(id: string): Promise<{
  success: boolean;
  data?: CategoryData;
  error?: string;
}> {
  try {
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return { success: false, error: "Category not found" };
    }

    const eventCount = await prisma.event.count({
      where: { category: category.name },
    });

    return { success: true, data: { ...category, eventCount } };
  } catch (error) {
    console.error("Failed to fetch category:", error);
    return { success: false, error: "Failed to fetch category" };
  }
}

export async function createCategory(data: {
  name: string;
  description?: string;
  color?: string;
  isActive?: boolean;
  sortOrder?: number;
}) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
      return {
        success: false,
        error: "Unauthorized: Only Admins can manage categories",
      };
    }

    const trimmedName = data.name.trim();
    if (!trimmedName) {
      return { success: false, error: "Category name is required" };
    }

    // Check unique case-insensitively
    const existing = await prisma.category.findFirst({
      where: {
        name: { equals: trimmedName, mode: "insensitive" },
      },
    });

    if (existing) {
      return {
        success: false,
        error: `Category "${trimmedName}" already exists`,
      };
    }

    let sortOrder = data.sortOrder;
    if (sortOrder === undefined || isNaN(sortOrder)) {
      const maxOrder = await prisma.category.aggregate({
        _max: { sortOrder: true },
      });
      sortOrder = (maxOrder._max.sortOrder ?? 0) + 1;
    }

    const category = await prisma.category.create({
      data: {
        name: trimmedName,
        description: data.description?.trim() || null,
        color: data.color?.trim() || "#931827",
        isActive: data.isActive !== undefined ? data.isActive : true,
        sortOrder: Number(sortOrder),
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/admin/events");
    revalidatePath("/admin/schedule");
    revalidatePath("/events");
    revalidatePath("/schedule");
    revalidatePath("/results");
    revalidatePath("/");

    return { success: true, data: category };
  } catch (error) {
    console.error("Failed to create category:", error);
    return { success: false, error: "Failed to create category" };
  }
}

export async function updateCategory(
  id: string,
  data: {
    name?: string;
    description?: string;
    color?: string;
    isActive?: boolean;
    sortOrder?: number;
  }
) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
      return {
        success: false,
        error: "Unauthorized: Only Admins can manage categories",
      };
    }

    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      return { success: false, error: "Category not found" };
    }

    const updatePayload: Record<string, unknown> = {};

    if (data.description !== undefined) {
      updatePayload.description = data.description?.trim() || null;
    }
    if (data.color !== undefined) {
      updatePayload.color = data.color?.trim() || null;
    }
    if (data.isActive !== undefined) {
      updatePayload.isActive = data.isActive;
    }
    if (data.sortOrder !== undefined && !isNaN(data.sortOrder)) {
      updatePayload.sortOrder = Number(data.sortOrder);
    }

    let nameChanged = false;
    let newName = existing.name;

    if (data.name !== undefined) {
      const trimmedName = data.name.trim();
      if (!trimmedName) {
        return { success: false, error: "Category name cannot be empty" };
      }

      if (trimmedName.toLowerCase() !== existing.name.toLowerCase()) {
        const duplicate = await prisma.category.findFirst({
          where: {
            id: { not: id },
            name: { equals: trimmedName, mode: "insensitive" },
          },
        });

        if (duplicate) {
          return {
            success: false,
            error: `Another category named "${trimmedName}" already exists`,
          };
        }
      }

      if (trimmedName !== existing.name) {
        nameChanged = true;
        newName = trimmedName;
      }
      updatePayload.name = trimmedName;
    }

    const updated = await prisma.$transaction(async (tx) => {
      // If the name changed, update all events with the old category name so data integrity is preserved
      if (nameChanged) {
        await tx.event.updateMany({
          where: { category: existing.name },
          data: { category: newName },
        });
      }

      return tx.category.update({
        where: { id },
        data: updatePayload,
      });
    });

    revalidatePath("/admin/categories");
    revalidatePath("/admin/events");
    revalidatePath("/admin/schedule");
    revalidatePath("/events");
    revalidatePath("/schedule");
    revalidatePath("/results");
    revalidatePath("/");

    return { success: true, data: updated };
  } catch (error) {
    console.error("Failed to update category:", error);
    return { success: false, error: "Failed to update category" };
  }
}

export async function deleteCategory(id: string): Promise<{
  success: boolean;
  error?: string;
  usedByEvents?: number;
}> {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
      return {
        success: false,
        error: "Unauthorized: Only Admins can delete categories",
      };
    }

    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return { success: false, error: "Category not found" };
    }

    // Check if category is being used by events
    const eventCount = await prisma.event.count({
      where: { category: category.name },
    });

    if (eventCount > 0) {
      return {
        success: false,
        usedByEvents: eventCount,
        error: `Cannot delete category "${category.name}" because it is currently assigned to ${eventCount} event(s). We recommend deactivating it instead so existing event records remain intact.`,
      };
    }

    await prisma.category.delete({
      where: { id },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/admin/events");
    revalidatePath("/admin/schedule");
    revalidatePath("/events");
    revalidatePath("/schedule");
    revalidatePath("/results");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete category:", error);
    return { success: false, error: "Failed to delete category" };
  }
}

export async function toggleCategoryActive(id: string, isActive: boolean) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
      return {
        success: false,
        error: "Unauthorized: Only Admins can modify categories",
      };
    }

    const category = await prisma.category.update({
      where: { id },
      data: { isActive },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/admin/events");
    revalidatePath("/events");
    revalidatePath("/schedule");
    revalidatePath("/results");
    revalidatePath("/");

    return { success: true, data: category };
  } catch (error) {
    console.error("Failed to toggle category active status:", error);
    return { success: false, error: "Failed to toggle active status" };
  }
}

export async function reorderCategories(orderedIds: string[]) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
      return {
        success: false,
        error: "Unauthorized: Only Admins can reorder categories",
      };
    }

    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.category.update({
          where: { id },
          data: { sortOrder: index + 1 },
        })
      )
    );

    revalidatePath("/admin/categories");
    revalidatePath("/admin/events");
    revalidatePath("/events");
    revalidatePath("/schedule");
    revalidatePath("/results");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Failed to reorder categories:", error);
    return { success: false, error: "Failed to reorder categories" };
  }
}
