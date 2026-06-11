"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  BarChart3,
  GraduationCap,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";

const links = [
  { href: "/", label: "Today", icon: LayoutDashboard },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/tests", label: "Tests", icon: ClipboardList },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <GraduationCap className="size-6 text-blue-500" />
          <span>Traqr</span>
        </Link>
        <nav className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/"
                ? pathname === "/"
                : pathname.startsWith(href);
            return (
              <Button
                key={href}
                variant={active ? "secondary" : "ghost"}
                size="sm"
                asChild
              >
                <Link href={href} className="gap-2">
                  <Icon className="size-4" />
                  {label}
                </Link>
              </Button>
            );
          })}
        </nav>
        {user && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              {user.photoURL && (
                <img
                  src={user.photoURL}
                  alt={user.displayName ?? ""}
                  className="size-6 rounded-full"
                  referrerPolicy="no-referrer"
                />
              )}
              <span className="hidden sm:inline text-muted-foreground text-xs truncate max-w-[120px]">
                {user.displayName ?? user.email}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={handleSignOut}
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
