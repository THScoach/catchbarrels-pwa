"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_TABS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/lesson/new", label: "New Lesson" },
  { href: "/lesson/history", label: "History" },
];

export function BarrelsHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#050814]">
      {/* Top row: logo + menu */}
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 pt-3 pb-2 sm:px-6">
        {/* Logo lockup */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2"
          aria-label="Barrels – Catch Barrels"
        >
          <div className="relative h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0">
            <Image
              src="/branding/barrels-mark-only.png"
              alt="Barrels logo"
              fill
              className="object-contain"
              priority
            />
          </div>

          <div className="leading-tight">
            <div className="text-[11px] font-semibold tracking-[0.18em] text-slate-100">
              BARRELS
            </div>
            <div className="text-[9px] font-medium uppercase tracking-[0.26em] text-amber-400">
              CATCH BARRELS
            </div>
          </div>
        </Link>

        {/* Right: hamburger (desktop + mobile) */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-700/70 bg-black/40 text-slate-200 hover:bg-slate-900"
          aria-label="Open menu"
        >
          <div className="space-y-1.5">
            <span className="block h-0.5 w-4 rounded bg-current" />
            <span className="block h-0.5 w-4 rounded bg-current" />
            <span className="block h-0.5 w-4 rounded bg-current" />
          </div>
        </button>
      </div>

      {/* Tab row */}
      <div className="mx-auto flex max-w-6xl px-4 pb-3 sm:px-6">
        <nav className="flex w-full gap-3">
          {NAV_TABS.map((tab) => {
            const active =
              pathname === tab.href ||
              (tab.href !== "/dashboard" && pathname?.startsWith(tab.href));

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={[
                  "flex-1 rounded-full border text-center text-sm font-semibold transition-all",
                  "px-3 py-2 sm:py-2.5",
                  active
                    ? "border-amber-400 bg-amber-400 text-slate-900 shadow-[0_0_18px_rgba(251,191,36,0.45)]"
                    : "border-slate-700/70 bg-[#0a0f1f] text-slate-200 hover:border-slate-500 hover:bg-slate-900",
                ].join(" ")}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Slide-down menu (when you tap hamburger) */}
      {open && (
        <div className="border-t border-slate-800 bg-[#050814]">
          <nav className="mx-auto flex max-w-6xl flex-col px-4 py-3 text-sm font-medium text-slate-100 sm:px-6">
            {NAV_TABS.map((tab) => {
              const active =
                pathname === tab.href ||
                (tab.href !== "/dashboard" && pathname?.startsWith(tab.href));
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-lg px-3 py-2 ${
                    active
                      ? "bg-amber-500/10 text-amber-300"
                      : "hover:bg-slate-900"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
            <button
              onClick={() => setOpen(false)}
              className="mt-2 self-start rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-wide text-slate-300 hover:bg-slate-900"
            >
              Close
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
