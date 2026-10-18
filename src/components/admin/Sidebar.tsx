import Link from "next/link";
import { Suspense } from "react";
import { NavLinks } from "./NavLinks";
import { LogoutButton } from "./LogoutButton";

export function Sidebar() {
  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col bg-black border-r border-neutral-800 min-h-screen">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-neutral-800">
        <Link href="/admin/forms" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logowhite.png" alt="MpiForm logo" className="h-8 w-auto" />
          <span className="text-xs font-medium bg-black text-white border border-white/20 px-1.5 py-0.5 rounded">
            Admin
          </span>
        </Link>
      </div>

      {/* Nav — needs usePathname so wrapped in Suspense */}
      <Suspense fallback={<NavFallback />}>
        <NavLinks />
      </Suspense>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-neutral-800 mt-auto flex flex-col gap-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          View Public Forms
        </Link>

        <LogoutButton />
      </div>
    </aside>
  );
}

function NavFallback() {
  return (
    <nav className="flex-1 px-3 py-4 flex flex-col gap-1" aria-label="Admin navigation">
      {[1, 2].map((i) => (
        <div key={i} className="h-10 rounded-lg bg-neutral-800 animate-pulse" />
      ))}
    </nav>
  );
}
