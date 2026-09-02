import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  BellRing,
  Check,
  ChevronsLeft,
  FileText,
  Headphones,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Search,
  Sun,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { AproLogo, AproMark } from "@/components/apro/Logo";
import { CopiloteWidget } from "@/components/apro/CopiloteWidget";
import { StatusDot } from "@/components/apro/bits";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth";
import { useNotifications } from "@/lib/notifications";
import { cn } from "@/lib/utils";

export const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, hue: "210" },
  { to: "/leads", label: "Leads & Qualification IA", icon: Users, hue: "160" },
  { to: "/devis", label: "Devis & Commandes IA", icon: FileText, hue: "245" },
  { to: "/relance", label: "Relance IA", icon: BellRing, hue: "40" },
  { to: "/service-client", label: "Service Client IA", icon: Headphones, hue: "300" },
] as const;

const isActive = (pathname: string, to: string) =>
  to === "/" ? pathname === "/" : pathname.startsWith(to);

function NavList({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate?: (() => void) | undefined;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className={cn("flex-1 space-y-1", collapsed ? "px-2" : "px-3")}>
      {nav.map((item) => {
        const active = isActive(pathname, item.to);
        const link = (
          <Link
            to={item.to}
            onClick={onNavigate}
            aria-label={item.label}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group relative flex h-11 items-center rounded-xl text-sm transition-[background-color,color,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
              collapsed ? "w-11 justify-center px-0" : "gap-3 px-3",
              active
                ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground active:scale-[0.97]",
            )}
          >
            {active && (
              <span className="absolute top-2 bottom-2 -left-2 w-1 rounded-full bg-sidebar-primary shadow-[0_0_12px_2px_color-mix(in_oklab,var(--sidebar-primary)_70%,transparent)]" />
            )}
            <item.icon
              className={cn(
                "h-[18px] w-[18px] shrink-0 transition-colors",
                active && "text-sidebar-primary",
              )}
            />
            <span
              className={cn(
                "overflow-hidden whitespace-nowrap transition-[opacity,max-width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                collapsed ? "pointer-events-none max-w-0 opacity-0" : "max-w-[180px] opacity-100",
              )}
            >
              {item.label}
            </span>
          </Link>
        );

        if (!collapsed) return <div key={item.to}>{link}</div>;
        return (
          <Tooltip key={item.to}>
            <TooltipTrigger asChild>{link}</TooltipTrigger>
            <TooltipContent side="right">{item.label}</TooltipContent>
          </Tooltip>
        );
      })}
    </nav>
  );
}

function SidebarBody({
  collapsed,
  onToggle,
  onNavigate,
}: {
  collapsed: boolean;
  onToggle?: (() => void) | undefined;
  onNavigate?: (() => void) | undefined;
}) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div
        className={cn(
          "flex items-center transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          collapsed ? "justify-center px-2 py-5" : "px-4 py-6",
        )}
      >
        {collapsed ? (
          <AproMark size={48} />
        ) : (
          <span className="flex w-full items-center justify-center rounded-2xl bg-white/95 px-5 py-4 shadow-[0_10px_30px_-16px_color-mix(in_oklab,var(--sidebar-primary)_90%,transparent)] dark:bg-white/10">
            <AproLogo height={52} />
          </span>
        )}
      </div>

      <NavList collapsed={collapsed} onNavigate={onNavigate} />

      <div className={cn("mt-4 mb-3", collapsed ? "px-2" : "px-3")}>
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? "Déplier la navigation" : "Réduire la navigation"}
            className={cn(
              "mb-2 flex h-10 items-center rounded-xl text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              collapsed ? "w-11 justify-center" : "w-full gap-3 px-3",
            )}
          >
            <ChevronsLeft
              className={cn(
                "h-[18px] w-[18px] shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                collapsed && "rotate-180",
              )}
            />
            {!collapsed && <span className="text-sm">Réduire</span>}
          </button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Menu du compte"
              className={cn(
                "flex items-center rounded-xl bg-sidebar-accent/70 py-2.5 transition-colors hover:bg-sidebar-accent",
                collapsed ? "w-11 justify-center px-0" : "w-full gap-3 px-3",
              )}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground">
                {user?.initials ?? "??"}
              </span>
              {!collapsed && (
                <span className="min-w-0 text-left leading-tight">
                  <span className="block truncate text-sm font-medium">{user?.name}</span>
                  <span className="block truncate text-[11px] text-sidebar-foreground/60">
                    {user?.role}
                  </span>
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-60">
            <DropdownMenuLabel className="leading-tight">
              <span className="block">{user?.name}</span>
              <span className="block text-xs font-normal text-muted-foreground">{user?.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => {
                signOut();
                navigate({ to: "/login", replace: true });
              }}
            >
              <LogOut className="mr-2 h-4 w-4" /> Se déconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function NotificationsBell() {
  const { notifications, unread, markAllRead, markRead } = useNotifications();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const toneClass: Record<string, string> = {
    info: "bg-accent",
    warning: "bg-warning",
    error: "bg-destructive",
    success: "bg-success",
  };

  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v && unread > 0) markAllRead();
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Notifications (${unread} non lues)`}
          className="press relative rounded-xl border border-border bg-card p-2 text-muted-foreground hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="animate-pop absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
              {unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[340px] p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-semibold">Notifications</p>
          <button
            type="button"
            onClick={markAllRead}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <Check className="h-3 w-3" /> Tout marquer comme lu
          </button>
        </div>
        <ul className="max-h-[340px] divide-y divide-border overflow-y-auto">
          {notifications.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => {
                  markRead(n.id);
                  setOpen(false);
                  navigate({ to: n.to });
                }}
                className={cn(
                  "flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-accent-soft",
                  !n.read && "bg-accent-soft/50",
                )}
              >
                <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", toneClass[n.tone])} />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-foreground">{n.title}</span>
                  <span className="block truncate text-xs text-muted-foreground">{n.detail}</span>
                  <span className="mt-0.5 block text-[11px] text-muted-foreground/70">
                    {n.time}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

function GlobalSearch() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    const lower = term.toLowerCase();
    const target =
      lower.startsWith("dev") || /\d{4}/.test(lower)
        ? "/devis"
        : lower.includes("lead")
          ? "/leads"
          : lower.includes("odoo")
            ? "/copilote"
            : "/devis";
    navigate({ to: target, search: { q: term } });
  };

  return (
    <form onSubmit={submit} className="relative ml-auto hidden max-w-sm flex-1 md:block">
      <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Rechercher un client, devis, lead…"
        className="bg-card pl-9"
      />
    </form>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const current = useMemo(() => nav.find((n) => isActive(pathname, n.to)), [pathname]);
  const [dark, setDark] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Mode clair par défaut : on ne passe en sombre que si l'utilisateur l'a choisi.
    setDark(window.localStorage.getItem("apro.theme") === "dark");
    setCollapsed(window.localStorage.getItem("apro.sidebar") === "collapsed");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const toggleCollapsed = () =>
    setCollapsed((v) => {
      window.localStorage.setItem("apro.sidebar", v ? "expanded" : "collapsed");
      return !v;
    });

  return (
    <TooltipProvider delayDuration={120}>
      <div
        className="ambient-canvas flex min-h-screen w-full bg-background"
        style={{ ["--section-hue" as string]: current?.hue ?? "210" }}
      >
        <aside
          className={cn(
            "sticky top-0 hidden h-screen shrink-0 border-r border-sidebar-border transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:block",
            collapsed ? "w-[76px]" : "w-64",
          )}
        >
          <SidebarBody collapsed={collapsed} onToggle={toggleCollapsed} />
        </aside>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <SidebarBody collapsed={false} onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur-xl md:px-6">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Ouvrir la navigation"
              className="press rounded-xl border border-border p-2 text-muted-foreground hover:text-foreground lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>

            <AproMark size={30} className="lg:hidden" />

            <h1 className="hidden shrink-0 truncate text-base font-semibold tracking-tight text-foreground sm:block">
              {current?.label ?? "Dashboard"}
            </h1>

            <GlobalSearch />


            <button
              type="button"
              onClick={() => {
                setDark((v) => {
                  window.localStorage.setItem("apro.theme", v ? "light" : "dark");
                  return !v;
                });
              }}
              aria-label="Basculer le mode sombre"
              className="press rounded-xl border border-border bg-card p-2 text-muted-foreground hover:text-foreground"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <NotificationsBell />
          </header>

          <main key={pathname} className="animate-rise flex-1 p-4 md:p-6">
            {children}
          </main>
        </div>

        <CopiloteWidget />
      </div>
    </TooltipProvider>
  );
}
