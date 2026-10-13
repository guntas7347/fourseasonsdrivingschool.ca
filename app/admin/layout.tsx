import React from "react";
import { connection } from "next/server";

export const instant = false;

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();

  return <>{children}</>;
}
