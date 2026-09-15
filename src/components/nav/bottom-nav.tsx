"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ScanLine, Library, Brain, User } from "lucide-react";
import clsx from "clsx";

const ITEMS = [
  { href: "/dashboard", label: "Accueil", icon: Home },
  { href: "/resoudre", label: "Scanner", icon: ScanLine },
  { href: "/bibliotheque", label: "Bibliothèque", icon: Library },
  { href: "/reviser", label: "Réviser", icon: Brain },
  { href: "/profil", label: "Profil", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-surface border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-2xl grid grid-cols-5">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex flex-col items-center gap-1 py-2.5 text-xs transition-colors",
                active ? "text-primary" : "text-text-secondary hover:text-text-primary"
              )}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
