import React from "react";

export const forceDynamic = true;

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
