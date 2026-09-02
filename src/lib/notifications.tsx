import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type AproNotification = {
  id: string;
  title: string;
  detail: string;
  tone: "info" | "warning" | "error" | "success";
  to: "/" | "/leads" | "/devis" | "/copilote" | "/service-client";
  time: string;
  read: boolean;
};

const seed: AproNotification[] = [
  {
    id: "n1",
    title: "Erreur de synchronisation Odoo",
    detail: "DEV-2026-0175 · code 409 conflit client",
    tone: "error",
    to: "/copilote",
    time: "il y a 8 min",
    read: false,
  },
  {
    id: "n2",
    title: "Devis DEV-2026-0184 expire dans 18h",
    detail: "Marjane Holding · 184 500 MAD",
    tone: "warning",
    to: "/devis",
    time: "il y a 42 min",
    read: false,
  },
  {
    id: "n3",
    title: "3 nouveaux leads WhatsApp",
    detail: "En attente de qualification depuis 24h",
    tone: "info",
    to: "/leads",
    time: "il y a 2 h",
    read: false,
  },
  {
    id: "n4",
    title: "Conversation client non traitée",
    detail: "Hôtel Atlas Marrakech · demande de tarif",
    tone: "info",
    to: "/service-client",
    time: "il y a 3 h",
    read: false,
  },
  {
    id: "n5",
    title: "Devis DEV-2026-0181 accepté",
    detail: "Clinique Al Amal · 96 200 MAD",
    tone: "success",
    to: "/devis",
    time: "hier",
    read: true,
  },
];

type Value = {
  notifications: AproNotification[];
  unread: number;
  markAllRead: () => void;
  markRead: (id: string) => void;
};

const Ctx = createContext<Value | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AproNotification[]>(seed);

  const markAllRead = useCallback(
    () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))),
    [],
  );
  const markRead = useCallback(
    (id: string) =>
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n))),
    [],
  );

  const value = useMemo(
    () => ({
      notifications,
      unread: notifications.filter((n) => !n.read).length,
      markAllRead,
      markRead,
    }),
    [notifications, markAllRead, markRead],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useNotifications() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useNotifications doit être utilisé dans NotificationsProvider");
  return ctx;
}
