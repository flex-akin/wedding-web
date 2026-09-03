import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { SiteTag } from "./SiteTag";

const NAV_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/rsvp", label: "RSVP" },
  { to: "/gifts", label: "Gifts" },
  { to: "/hotel", label: "Hotel Reservations" },
  { to: "/asoebi-payment", label: "Aso-Ebi Payment" },
  { to: "/photos", label: "Photo Wall" },
];

export function Layout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-svh flex-col bg-ivory">
      <header className="sticky top-0 z-30 border-b border-sage/15 bg-ivory/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" onClick={() => setOpen(false)}>
            <SiteTag />
          </Link>

          <nav className="hidden flex-wrap justify-end gap-x-5 gap-y-1 sm:flex">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `font-mono text-sm transition-colors ${
                    isActive ? "text-terracotta" : "text-sage hover:text-terracotta"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <button
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-sage/30 sm:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="font-mono text-lg text-sage">{open ? "×" : "☰"}</span>
          </button>
        </div>

        {open && (
          <nav className="flex flex-col gap-1 border-t border-sage/15 px-4 py-2 sm:hidden">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2.5 font-mono text-sm ${
                    isActive ? "bg-sage/10 text-terracotta" : "text-sage"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-sage/15 px-4 py-8 text-center">
        <SiteTag />
        <p className="mt-2 font-mono text-xs text-ink/50">
          built with love (and a few late-night commits)
        </p>
      </footer>
    </div>
  );
}
