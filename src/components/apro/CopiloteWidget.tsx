import { Bot, Maximize2, Mic, Send, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatMAD } from "@/lib/apro-data";
import { cn } from "@/lib/utils";

type Msg = { from: "user" | "agent"; text: string; table?: { label: string; value: string }[] };

const initialMessages: Msg[] = [
  {
    from: "agent",
    text: "Bonjour 👋 Je suis le Copilote Odoo d'APRO Hygiène. Demandez-moi un bilan de ventes, un contrôle de stock ou une action Odoo.",
  },
  {
    from: "agent",
    text: "Bilan des ventes de juillet 2026 :",
    table: [
      { label: "Chiffre d'affaires", value: formatMAD(1284500) },
      { label: "Commandes validées", value: "47" },
      { label: "Panier moyen", value: formatMAD(27330) },
    ],
  },
];

/** Copilote IA en bulle flottante (hors sidebar). */
export function CopiloteWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [open, messages]);

  const send = () => {
    const question = input.trim();
    if (!question) return;
    setInput("");
    setMessages((m) => [...m, { from: "user", text: question }]);
    setThinking(true);
    window.setTimeout(() => {
      setThinking(false);
      setMessages((m) => [
        ...m,
        {
          from: "agent",
          text: `Requête traitée sur Odoo : « ${question} ». Voici la synthèse :`,
          table: [
            { label: "Enregistrements analysés", value: "312" },
            { label: "Références concernées", value: "18" },
            { label: "Alertes détectées", value: "2" },
          ],
        },
      ]);
    }, 700);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fermer le Copilote IA" : "Ouvrir le Copilote IA"}
        className={cn(
          "fixed right-5 bottom-5 z-40 flex h-14 w-14 items-center justify-center rounded-full",
          "bg-gradient-to-br from-accent to-primary text-accent-foreground",
          "shadow-[0_18px_40px_-14px_color-mix(in_oklab,var(--accent)_85%,transparent)]",
          "transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 active:scale-95",
        )}
      >
        <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-accent/25" />
        {open ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
      </button>

      <div
        className={cn(
          "fixed right-5 bottom-24 z-40 flex w-[min(380px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-border bg-popover shadow-[0_28px_70px_-28px_color-mix(in_oklab,var(--primary)_75%,transparent)]",
          "origin-bottom-right transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          open
            ? "pointer-events-auto scale-100 opacity-100"
            : "pointer-events-none translate-y-3 scale-90 opacity-0",
        )}
      >
        <div className="flex items-center gap-3 border-b border-border bg-gradient-to-r from-primary to-accent px-4 py-3 text-primary-foreground">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
            <Sparkles className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Agent Copilote IA</p>
            <p className="text-[11px] opacity-80">Connecté à Odoo</p>
          </div>
          <Link
            to="/copilote"
            onClick={() => setOpen(false)}
            aria-label="Ouvrir la vue complète du copilote"
            className="rounded-lg p-1.5 transition-colors hover:bg-white/15"
          >
            <Maximize2 className="h-4 w-4" />
          </Link>
        </div>

        <div className="flex h-[360px] flex-col gap-3 overflow-y-auto p-4">
          {messages.map((m, i) => (
            <div key={i} className={cn("max-w-[88%] space-y-2", m.from === "user" && "ml-auto")}>
              <p
                className={cn(
                  "rounded-2xl px-3 py-2 text-sm",
                  m.from === "user"
                    ? "rounded-br-sm bg-primary text-primary-foreground"
                    : "rounded-bl-sm bg-muted text-foreground",
                )}
              >
                {m.text}
              </p>
              {m.table && (
                <div className="overflow-hidden rounded-xl border border-border">
                  <table className="w-full text-xs">
                    <tbody>
                      {m.table.map((r, j) => (
                        <tr
                          key={j}
                          className={cn(
                            "border-b border-border last:border-0",
                            j % 2 === 1 && "bg-muted/40",
                          )}
                        >
                          <td className="px-3 py-1.5 text-muted-foreground">{r.label}</td>
                          <td className="px-3 py-1.5 text-right font-semibold text-foreground">
                            {r.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
          {thinking && (
            <div className="flex w-16 items-center justify-center gap-1 rounded-2xl rounded-bl-sm bg-muted px-3 py-3">
              {[0, 1, 2].map((d) => (
                <span
                  key={d}
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent"
                  style={{ animationDelay: `${d * 120}ms` }}
                />
              ))}
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="flex items-center gap-2 border-t border-border p-3">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Poser une question à Odoo…"
            className="h-9"
          />
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            aria-label="Commande vocale"
            onClick={() => toast.success("Écoute vocale activée…")}
          >
            <Mic className="h-4 w-4" />
          </Button>
          <Button size="icon" className="h-9 w-9 shrink-0" aria-label="Envoyer" onClick={send}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
}
