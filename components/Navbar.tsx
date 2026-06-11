"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  BarChart3,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/", label: "Today", icon: LayoutDashboard },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/tests", label: "Tests", icon: ClipboardList },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

export function Navbar() {
  const pathname = usePathname();

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
      </div>
    </header>
  );
}
