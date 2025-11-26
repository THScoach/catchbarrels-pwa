"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Menu, X } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/lesson/new", label: "Sessions" },
  { href: "/video", label: "Videos" },
  { href: "/coach", label: "Coach Rick" },
];

export function BarrelsHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { data: session } = useSession() || {};

  // Get user initials for avatar
  const getInitials = () => {
    if (!session?.user?.name) return "RS";
    const names = session.user.name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return names[0].substring(0, 2).toUpperCase();
  };

  // Get latest momentum score (TODO: fetch from actual data)
  const momentumScore = 84;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Left: Logo + wordmark */}
        <Link
          href="/dashboard"
          className="flex items-center gap-3"
          aria-label="Barrels – Catch Barrels"
        >
          <div className="relative h-9 w-9 sm:h-11 sm:w-11 flex-shrink-0">
            <Image
              src="/branding/barrels-mark-only.png"
              alt="Barrels logo"
              fill
              className="object-contain"
              priority
            />
          </div>

          <div className="leading-tight hidden xs:block">
            <div className="text-sm font-semibold tracking-[0.2em] text-slate-300">
              BARRELS
            </div>
            <div className="text-[10px] font-medium uppercase tracking-[0.25em] text-amber-400">
              CATCH BARRELS
            </div>
          </div>
        </Link>

        {/* Center / Right: navigation */}
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-300 md:flex">
          {NAV_ITEMS.map((item) => {
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors hover:text-white ${
                  active ? "text-amber-400" : ""
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Momentum pill + profile */}
        <div className="flex items-center gap-3">
          {/* Momentum Transfer mini pill */}
          <div className="hidden items-center gap-1 rounded-full border border-amber-500/70 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-300 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span>Momentum</span>
            <span className="text-slate-200">{momentumScore}</span>
          </div>

          {/* Avatar / profile button */}
          <Link
            href="/profile"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-[11px] font-semibold uppercase text-slate-200 border border-slate-700 hover:border-amber-500/50 transition-colors"
          >
            {getInitials()}
          </Link>

          {/* Mobile menu button */}
          <button
            className="inline-flex items-center justify-center rounded-md p-2 text-slate-300 hover:bg-slate-800 md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle navigation"
          >
            <span className="sr-only">Toggle Menu</span>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {open && (
        <div className="border-t border-slate-800 bg-slate-950 md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col px-4 py-3 text-sm font-medium text-slate-200">
            {NAV_ITEMS.map((item) => {
              const active = pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-md px-2 py-2 hover:bg-slate-900 ${
                    active ? "text-amber-300" : ""
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            {/* Show momentum in mobile menu */}
            <div className="mt-2 flex items-center gap-2 rounded-md bg-slate-900 px-2 py-2 text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              <span className="text-slate-400">Momentum Transfer:</span>
              <span className="font-semibold text-amber-300">{momentumScore}</span>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
