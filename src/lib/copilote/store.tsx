import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import {
  leads as leadsSeed,
  orders as ordersSeed,
  quotes as quotesSeed,
  relanceItems as relancesSeed,
  type Lead,
  type Order,
  type Quote,
  type RelanceItem,
} from "@/lib/apro-data";
import { clientsSeed, productsSeed, wpSeed, type Client, type Product, type WpSite } from "./data";

export type CopiloteState = {
  clients: Client[];
  products: Product[];
  leads: Lead[];
  quotes: Quote[];
  orders: Order[];
  relances: RelanceItem[];
  wp: WpSite;
};

export type HistoryEntry = {
  id: string;
  at: string;
  title: string;
  detail: string;
  scope: "Odoo" | "Site web" | "Lecture";
  status: "ok" | "error";
  author: string;
};

type StoreValue = {
  state: CopiloteState;
  update: (fn: (s: CopiloteState) => CopiloteState) => void;
  history: HistoryEntry[];
  pushHistory: (e: Omit<HistoryEntry, "id" | "at">) => void;
  clearHistory: () => void;
};

const StoreContext = createContext<StoreValue | null>(null);

const initialState = (): CopiloteState => ({
  clients: clientsSeed.map((c) => ({ ...c })),
  products: productsSeed.map((p) => ({ ...p })),
  leads: leadsSeed.map((l) => ({ ...l })),
  quotes: quotesSeed.map((q) => ({ ...q })),
  orders: ordersSeed.map((o) => ({ ...o })),
  relances: relancesSeed.map((r) => ({ ...r })),
  wp: JSON.parse(JSON.stringify(wpSeed)) as WpSite,
});

export function CopiloteStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CopiloteState>(initialState);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const update = useCallback((fn: (s: CopiloteState) => CopiloteState) => {
    setState((s) => fn(s));
  }, []);

  const pushHistory = useCallback((e: Omit<HistoryEntry, "id" | "at">) => {
    setHistory((h) => [
      {
        ...e,
        id: `h${Date.now()}${Math.random().toString(16).slice(2, 6)}`,
        at: new Date().toLocaleString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
      ...h,
    ]);
  }, []);

  const clearHistory = useCallback(() => setHistory([]), []);

  const value = useMemo(
    () => ({ state, update, history, pushHistory, clearHistory }),
    [state, update, history, pushHistory, clearHistory],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useCopiloteStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useCopiloteStore doit être utilisé dans CopiloteStoreProvider");
  return ctx;
}
