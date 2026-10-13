import React from "react";
import { connection } from "next/server";

// Opt /admin out of instant static-shell prerender validation so it is purely dynamic at request time
export const instant = false;

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Only force dynamic in /admin as requested
  await connection();
  return <>{children}</>;
}
