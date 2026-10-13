import React from "react";
import { connection } from "next/server";
import AdminLayout from "@/components/admin/AdminLayout";

export const instant = false;

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();

  return <AdminLayout>{children}</AdminLayout>;
}
