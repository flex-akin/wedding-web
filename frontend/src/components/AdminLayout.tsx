import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { SiteTag } from "./SiteTag";
import { clearAdminToken } from "../api/client";

const ADMIN_LINKS = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/guests", label: "Guests" },
  { to: "/admin/photos", label: "Photo Moderation" },
  { to: "/admin/wishes", label: "Wishes" },
  { to: "/admin/hotel-reservations", label: "Hotel Reservations" },
  { to: "/admin/settings", label: "Settings" },
];

export function AdminLayout() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    clearAdminToken();
    navigate("/admin/login");
  }

  return (
    <div className="min-h-svh bg-ivory">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-sage/15 bg-ivory/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="flex items-center gap-3">
          <SiteTag />
          <span className="hidden font-mono text-xs text-terracotta sm:inline">/admin</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleLogout}
            className="rounded-md border border-terracotta/40 px-3 py-1.5 font-mono text-xs text-terracotta hover:bg-terracotta/10"
          >
            Log out
          </button>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-sage/30 lg:hidden"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="font-mono text-lg text-sage">{open ? "×" : "☰"}</span>
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row">
        <nav className={`flex-col gap-1 lg:flex lg:w-48 ${open ? "flex" : "hidden"}`}>
          {ADMIN_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `rounded-md px-3 py-2.5 font-mono text-sm ${
                  isActive
                    ? "bg-sage/10 text-terracotta"
                    : "text-sage hover:bg-sage/5"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
