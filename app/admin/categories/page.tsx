import React from "react";
import { getCategories } from "@/actions/categories";
import { PageHeader } from "@/components/ui/PageHeader";
import { CategoryManagementClient } from "@/components/categories/CategoryManagementClient";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const result = await getCategories(true);
  const categories = result.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Event Categories"
        description="Manage festival competition tracks, categories, display ordering, and visibility."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Categories" },
        ]}
      />

      <CategoryManagementClient categories={categories} />
    </div>
  );
}
