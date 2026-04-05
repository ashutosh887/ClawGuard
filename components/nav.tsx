"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, LayoutDashboard, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import config from "@/config";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/chat", label: "Chat", icon: MessageSquare },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-card-border bg-card sticky top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 h-14">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <Shield className="h-5 w-5 text-accent" />
          {config.appName}
        </Link>

        <div className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-accent/10 text-accent"
                  : "text-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
          <a
            href="/auth/login"
            className="ml-3 rounded-lg bg-accent px-3.5 py-1.5 text-sm font-medium text-white hover:bg-accent/90 transition-colors"
          >
            Login
          </a>
        </div>
      </div>
    </nav>
  );
}
