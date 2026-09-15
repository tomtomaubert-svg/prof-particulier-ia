"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("theme") as "light" | "dark" | null;
    if (stored) {
      document.documentElement.setAttribute("data-theme", stored);
      // Lecture unique d'une préférence persistée au montage : ce n'est pas
      // une boucle de synchronisation, un eslint-disable ciblé est plus sûr
      // qu'une gymnastique d'init lazy incompatible avec le SSR (localStorage
      // n'existe pas côté serveur).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme(stored);
    }
  }, []);

  function toggle() {
    const current =
      theme ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    setTheme(next);
  }

  return (
    <button
      onClick={toggle}
      aria-label="Changer de thème"
      className="h-9 w-9 flex items-center justify-center rounded-full border border-border bg-surface hover:bg-surface-raised transition-colors"
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
