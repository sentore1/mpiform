"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { NavLinks } from "./NavLinks";
import { LogoutButton } from "./LogoutButton";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={[
        "shrink-0 hidden md:flex flex-col bg-neutral-700 border-r border-neutral-600 min-h-screen transition-all duration-300 relative",
        collapsed ? "w-16" : "w-64",
      ].join(" ")}
    >
      {/* Logo */}
      <div
        className={[
          "flex items-center border-b border-neutral-600 h-[60px]",
          collapsed ? "justify-center px-2" : "px-6",
        ].join(" ")}
      >
        {collapsed ? (
          // Show just the logo mark when collapsed
          <Link href="/admin/forms" title="Dashboard">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logowhite.png" alt="MpiForm" className="h-7 w-auto" />
          </Link>
        ) : (
          <Link href="/admin/forms" className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logowhite.png" alt="MpiForm logo" className="h-8 w-auto" />
            <span className="text-xs font-medium bg-neutral-700 text-white border border-white/20 px-1.5 py-0.5 rounded">
              Admin
            </span>
          </Link>
        )}
      </div>

      {/* Nav */}
      <Suspense fallback={<NavFallback collapsed={collapsed} />}>
        <NavLinks collapsed={collapsed} />
      </Suspense>

      {/* Footer */}
      <div
        className={[
          "py-4 border-t border-neutral-600 mt-auto flex flex-col gap-1",
          collapsed ? "px-2 items-center" : "px-3",
        ].join(" ")}
      >
        <Link
          href="/"
          target="_blank"
          title={collapsed ? "View Public Forms" : undefined}
          className={[
            "flex items-center rounded-lg text-sm text-neutral-400 hover:bg-neutral-600 hover:text-neutral-100 transition-colors",
            collapsed ? "justify-center w-10 h-10" : "gap-2 px-3 py-2",
          ].join(" ")}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          {!collapsed && "View Public Forms"}
        </Link>

        <LogoutButton collapsed={collapsed} />
      </div>

      {/* Collapse / expand toggle — sits on the right edge */}
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute -right-3 top-[22px] z-10 flex items-center justify-center w-6 h-6 rounded-full bg-neutral-600 hover:bg-neutral-500 text-white shadow border border-neutral-500 transition-colors"
      >
        <svg
          className={`w-3 h-3 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </aside>
  );
}

function NavFallback({ collapsed }: { collapsed: boolean }) {
  return (
    <nav className="flex-1 px-3 py-4 flex flex-col gap-1" aria-label="Admin navigation">
      {[1, 2].map((i) => (
        <div
          key={i}
          className={[
            "rounded-lg bg-neutral-600 animate-pulse",
            collapsed ? "w-10 h-10" : "h-10",
          ].join(" ")}
        />
      ))}
    </nav>
  );
}
