import { FileText, Moon, PanelLeftClose, PanelLeftOpen, Sun, Users, Wrench } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "cn";
import { UniverseStatusBar } from "@/components/layout/UniverseStatusBar";

const NAV_ITEMS = [
  { to: "/persona", label: "Persona", icon: Users, description: "Customers & their banking state" },
  { to: "/policies", label: "Policies", icon: FileText, description: "Banking knowledge base" },
  { to: "/tools", label: "Tools", icon: Wrench, description: "Agent & user tool metadata" },
] as const;

const SIDEBAR_STORAGE_KEY = "money-heist-sidebar-open";

function useDarkMode() {
  const [dark, setDark] = useState(
    () => document.documentElement.classList.contains("dark") ||
      window.matchMedia?.("(prefers-color-scheme: dark)").matches,
  );
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  return [dark, setDark] as const;
}

function useSidebarOpen() {
  const [open, setOpen] = useState(() => {
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    return stored === null ? true : stored === "true";
  });
  useEffect(() => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(open));
  }, [open]);
  return [open, setOpen] as const;
}

export function AppShell({ children }: { children: ReactNode }) {
  const [dark, setDark] = useDarkMode();
  const [sidebarOpen, setSidebarOpen] = useSidebarOpen();

  return (
    <div className="flex min-h-svh">
      {sidebarOpen && (
        <aside className="hidden w-56 shrink-0 flex-col border-r bg-card/40 md:flex">
          <div className="flex items-center justify-between gap-2 px-4 py-4">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold tracking-tight">
                Money Heist Contributor Tools
              </div>
              <div className="text-xs text-muted-foreground">Banking universe viewers</div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="size-7 shrink-0"
              onClick={() => setSidebarOpen(false)}
            >
              <PanelLeftClose className="size-4" />
            </Button>
          </div>
          <nav className="flex flex-1 flex-col gap-1 px-2">
            {NAV_ITEMS.map(({ to, label, icon: Icon, description }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground/80 hover:bg-accent hover:text-accent-foreground",
                  )
                }
              >
                <Icon className="size-4 shrink-0" />
                <span className="flex flex-col">
                  <span className="font-medium leading-tight">{label}</span>
                  <span className="text-[11px] leading-tight opacity-70">{description}</span>
                </span>
              </NavLink>
            ))}
          </nav>
          <div className="border-t p-3 text-[11px] text-muted-foreground">
            Data loads live from the runtime universe archive.
          </div>
        </aside>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b px-3 sm:gap-4 sm:px-4">
          <div className="flex min-w-0 items-center gap-1">
            {!sidebarOpen && (
              <Button
                size="icon"
                variant="ghost"
                className="hidden size-8 shrink-0 md:inline-flex"
                onClick={() => setSidebarOpen(true)}
              >
                <PanelLeftOpen className="size-4" />
              </Button>
            )}
            <nav className="flex min-w-0 items-center gap-1 md:hidden">
              {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium",
                      isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent",
                    )
                  }
                >
                  <Icon className="size-3.5" />
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex min-w-0 items-center gap-1.5 sm:gap-3">
            <UniverseStatusBar />
            <Button size="icon" variant="ghost" className="size-8 shrink-0" onClick={() => setDark((d) => !d)}>
              {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
          </div>
        </header>
        <main className="min-w-0 flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
