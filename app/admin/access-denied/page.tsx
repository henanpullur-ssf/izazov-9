import React from "react";
import { AccessDenied } from "@/components/ui/AccessDenied";

export const dynamic = "force-dynamic";

export default async function AccessDeniedPage({
  searchParams,
}: {
  searchParams: Promise<{ module?: string; permission?: string; required?: string }>;
}) {
  const params = await searchParams;

  let message: string | undefined;
  if (params.required) {
    message = `This area requires ${params.required} privileges. Please contact the administrator.`;
  }

  return (
    <AccessDenied
      moduleName={params.module}
      permissionName={params.permission}
      message={message}
    />
  );
}
