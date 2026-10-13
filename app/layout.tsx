import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FOUR SEASONS DRIVING SCHOOL | SURREY",
  description:
    "Leading driving school in Surrey for Class 5, Class 7L, and Defensive driving courses",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
