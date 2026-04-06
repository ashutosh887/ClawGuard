"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessageSquare, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import config from "@/config";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/chat", label: "Chat", icon: MessageSquare },
];

const connections = [
  { name: "Google", color: "bg-success" },
  { name: "Slack", color: "bg-success" },
  { name: "GitHub", color: "bg-success" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-card-border bg-card sticky top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 h-14">
        <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
          <Image src="/logo.png" alt="ClawGuard" width={24} height={24} className="dark:invert" />
          <span className="hidden sm:inline text-sm">{config.appName}</span>
        </Link>

        <div className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors",
                pathname === href
                  ? "bg-foreground/5 text-foreground font-medium"
                  : "text-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-lg border border-card-border px-3 py-1.5">
            <Globe className="h-3.5 w-3.5 text-muted" />
            <div className="flex items-center gap-1.5">
              {connections.map((c) => (
                <div key={c.name} className="group/dot relative">
                  <div className={cn("h-2 w-2 rounded-full animate-pulse-dot", c.color)} />
                  <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 rounded bg-foreground px-1.5 py-0.5 text-[9px] text-background font-medium opacity-0 group-hover/dot:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    {c.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <a
            href="/auth/login"
            className="rounded-lg bg-foreground px-3.5 py-1.5 text-sm font-medium text-background hover:opacity-90 transition-opacity"
          >
            Login
          </a>
        </div>
      </div>
    </nav>
  );
}
