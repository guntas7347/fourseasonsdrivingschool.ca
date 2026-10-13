import React from "react";
import { connection } from "next/server";

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();

  return <>{children}</>;
}
