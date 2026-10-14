"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Car,
  LayoutDashboard,
  Package,
  Calendar,
  BookOpen,
  LogOut,
  LogIn,
  Menu,
  X,
  PlusCircle,
  ExternalLink,
  Shield,
  Loader2,
  HelpCircle,
  Settings,
  AlertTriangle,
  Image as ImageIcon,
  ShoppingBag,
  DollarSign,
} from "lucide-react";
import { auth, googleLogin } from "@/lib/firebase/googleLogin";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { checkIsEmailAuthorizedAction } from "@/lib/actions/config";

interface AdminLayoutProps {
  children: React.ReactNode;
}

function AdminLayoutInner({ children }: AdminLayoutProps) {
  const [user, setUser] = useState<User | null>(() => auth.currentUser);
  const [loading, setLoading] = useState<boolean>(() => {
    // If already verified in current session and current user exists, start with loading = false
    if (typeof window !== "undefined") {
      const cached = sessionStorage.getItem("admin_verified_email");
      if (cached && auth.currentUser && auth.currentUser.email === cached) {
        return false;
      }
    }
    return true;
  });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("admin_verified_email");
        }
        setUser(null);
        setLoading(false);
        return;
      }

      // Check if email was already verified in this session
      const cached =
        typeof window !== "undefined"
          ? sessionStorage.getItem("admin_verified_email")
          : null;
      if (
        cached &&
        cached.toLowerCase() === (currentUser.email || "").toLowerCase()
      ) {
        setUser(currentUser);
        setLoading(false);
        return;
      }

      // Check if user's Google email is in the allowed Gmails list
      try {
        const check = await checkIsEmailAuthorizedAction(currentUser.email);
        if (!check.authorized) {
          if (typeof window !== "undefined") {
            sessionStorage.removeItem("admin_verified_email");
          }
          await signOut(auth);
          setUser(null);
          setLoginError(
            check.reason ||
              `Access Denied: Google account "${currentUser.email}" is not authorized. Redirecting to home...`,
          );
          setTimeout(() => {
            router.push("/");
          }, 2500);
          setLoading(false);
          return;
        }

        if (typeof window !== "undefined" && currentUser.email) {
          sessionStorage.setItem(
            "admin_verified_email",
            currentUser.email.toLowerCase(),
          );
        }
        setUser(currentUser);
        setLoading(false);
      } catch (err) {
        console.error("Auth verification error:", err);
        setUser(currentUser);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleGoogleLogin = async () => {
    try {
      setLoginLoading(true);
      setLoginError(null);
      const cred = await googleLogin();
      if (cred && cred.user?.email) {
        const check = await checkIsEmailAuthorizedAction(cred.user.email);
        if (!check.authorized) {
          if (typeof window !== "undefined") {
            sessionStorage.removeItem("admin_verified_email");
          }
          await signOut(auth);
          setUser(null);
          setLoginError(
            check.reason ||
              `Access Denied: Google account "${cred.user.email}" is not authorized. Redirecting to home...`,
          );
          setTimeout(() => {
            router.push("/");
          }, 2500);
          return;
        }
        if (typeof window !== "undefined") {
          sessionStorage.setItem(
            "admin_verified_email",
            cred.user.email.toLowerCase(),
          );
        }
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      setLoginError(err?.message || "Google sign-in failed. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("admin_verified_email");
      }
      await signOut(auth);
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-800" />
          <p className="text-sm font-medium text-zinc-600">
            Verifying Admin Access...
          </p>
        </div>
      </div>
    );
  }

  // Not logged in: Show Google Sign-in Page
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-zinc-50 px-4 py-12 selection:bg-emerald-100">
        <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl shadow-zinc-950/5">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-white shadow-md">
              <img src="/images/logo-trans.png" alt="Logo" />
            </div>
            <h1 className="mt-5 text-2xl font-bold tracking-tight text-zinc-900">
              Four Seasons Driving School
            </h1>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Instructor &amp; Management Portal
            </p>
            <p className="mt-3 text-sm text-zinc-500">
              Sign in with your authorized Google account to manage packages,
              lesson slots, and bookings.
            </p>
          </div>

          {loginError && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 text-center">
              {loginError}
            </div>
          )}

          <div className="mt-8 space-y-4">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loginLoading}
              className="w-full flex items-center justify-center gap-3 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50 active:scale-95 disabled:opacity-50"
            >
              {loginLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-zinc-800" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>
                {loginLoading ? "Signing in..." : "Continue with Google"}
              </span>
            </button>

            <div className="pt-4 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 transition"
              >
                <span>&larr; Return to public homepage</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Navigation Links
  const navItems = [
    {
      label: "Overview & Stats",
      href: "/admin",
      icon: LayoutDashboard,
      active: pathname === "/admin",
    },
    {
      label: "Stripe Transactions",
      href: "/admin/transactions",
      icon: DollarSign,
      active: pathname.startsWith("/admin/transactions"),
    },
    {
      label: "Packages",
      href: "/admin/packages",
      icon: Package,
      active: pathname.startsWith("/admin/packages"),
    },
    {
      label: "Purchased Packages",
      href: "/admin/purchased-packages",
      icon: ShoppingBag,
      active: pathname.startsWith("/admin/purchased-packages"),
    },
    {
      label: "Lesson Slots",
      href: "/admin/slots",
      icon: Calendar,
      active: pathname.startsWith("/admin/slots"),
    },
    {
      label: "Bookings",
      href: "/admin/bookings",
      icon: BookOpen,
      active: pathname === "/admin/bookings",
    },
    {
      label: "FAQs (CMS)",
      href: "/admin/faqs",
      icon: HelpCircle,
      active: pathname.startsWith("/admin/faqs"),
    },
    {
      label: "Gallery (CMS)",
      href: "/admin/gallery",
      icon: ImageIcon,
      active: pathname.startsWith("/admin/gallery"),
    },
    {
      label: "Admin Config",
      href: "/admin/config",
      icon: Settings,
      active: pathname === "/admin/config",
    },
  ];

  return (
    <div className="min-h-screen flex bg-zinc-50 text-zinc-900">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-64 flex-col border-r border-zinc-200 bg-white">
        {/* Brand */}
        <div className="flex h-20 items-center gap-3 border-b border-zinc-100 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-white shadow-xs">
            <img src="/images/logo-trans.png" alt="Logo" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-zinc-900 leading-tight">
              FOUR SEASONS
            </h2>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
              Admin Portal
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                  item.active
                    ? "bg-zinc-900 text-white font-semibold shadow-xs"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${
                    item.active ? "text-emerald-400" : "text-zinc-400"
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card & Sign Out */}
        <div className="border-t border-zinc-100 p-4">
          <div className="mb-3 flex items-center gap-3">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || "Admin"}
                className="h-9 w-9 rounded-full border border-zinc-200"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-200 font-bold text-zinc-700">
                {user.displayName?.[0] || user.email?.[0] || "A"}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-zinc-900">
                {user.displayName || "Admin User"}
              </p>
              <p className="truncate text-[10px] text-zinc-500">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition"
            >
              <ExternalLink className="h-3 w-3" />
              <span>Live Site</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center justify-center gap-1 rounded-lg border border-red-200 bg-red-50/50 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 transition"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="flex md:hidden h-16 items-center justify-between border-b border-zinc-200 bg-white px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white">
              <Car className="h-4 w-4 text-emerald-400" />
            </div>
            <span className="text-sm font-bold text-zinc-900">
              Four Seasons Admin
            </span>
          </div>

          <button
            type="button"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="rounded-lg p-2 text-zinc-700 hover:bg-zinc-100"
            aria-label="Toggle Navigation"
          >
            {mobileSidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </header>

        {/* Mobile Menu Dropdown */}
        {mobileSidebarOpen && (
          <div className="border-b border-zinc-200 bg-white p-4 md:hidden shadow-md">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                      item.active
                        ? "bg-zinc-900 text-white font-semibold"
                        : "text-zinc-700 hover:bg-zinc-100"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
              <span className="text-xs text-zinc-500 truncate">
                {user.email}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1 text-xs text-red-600 font-medium"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}

        {/* Subpage Contents */}
        <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-zinc-50">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-800" />
        </div>
      }
    >
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </Suspense>
  );
}
