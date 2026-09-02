import { Bot, History, Maximize2, Minimize2, Sparkles, X } from "lucide-react";
import { useState } from "react";

import { CopiloteChat } from "@/components/apro/CopiloteChat";
import { ActionHistory } from "@/components/apro/CopiloteHistory";
import { cn } from "@/lib/utils";

/** Copilote IA en bulle flottante, avec mode plein écran (espace de travail IA). */
export function CopiloteWidget() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fermer le Copilote IA" : "Ouvrir le Copilote IA"}
        className={cn(
          "fixed right-5 bottom-5 z-50 flex h-14 w-14 items-center justify-center rounded-full",
          "bg-gradient-to-br from-accent to-primary text-accent-foreground",
          "shadow-[0_18px_40px_-14px_color-mix(in_oklab,var(--accent)_85%,transparent)]",
          "transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 active:scale-95",
        )}
      >
        {!open && <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-accent/25" />}
        {open ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
      </button>

      {/* voile en mode agrandi */}
      <div
        onClick={() => setExpanded(false)}
        className={cn(
          "fixed inset-0 z-40 bg-foreground/25 backdrop-blur-[2px] transition-opacity duration-300",
          open && expanded ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <div
        className={cn(
          "fixed z-40 flex flex-col overflow-hidden border border-border bg-popover",
          "shadow-[0_28px_70px_-28px_color-mix(in_oklab,var(--primary)_75%,transparent)]",
          "transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
          expanded
            ? "inset-3 rounded-3xl md:inset-x-[4vw] md:inset-y-[4vh]"
            : "right-5 bottom-24 h-[520px] w-[min(400px,calc(100vw-2.5rem))] origin-bottom-right rounded-2xl",
          open ? "pointer-events-auto scale-100 opacity-100" : "pointer-events-none translate-y-3 scale-90 opacity-0",
        )}
      >
        <div className="flex items-center gap-3 border-b border-border bg-gradient-to-r from-primary to-accent px-4 py-3 text-primary-foreground">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
            <Sparkles className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Copilote IA — Centre de commande</p>
            <p className="text-[11px] opacity-80">Données de la plateforme · Site web du client</p>
          </div>
          {expanded && (
            <button
              type="button"
              onClick={() => setShowHistory((v) => !v)}
              aria-label="Historique des actions"
              className={cn(
                "rounded-lg p-1.5 transition-colors hover:bg-white/15",
                showHistory && "bg-white/20",
              )}
            >
              <History className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? "Réduire la fenêtre" : "Agrandir la fenêtre"}
            className="rounded-lg p-1.5 transition-colors hover:bg-white/15"
          >
            {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fermer le copilote"
            className="rounded-lg p-1.5 transition-colors hover:bg-white/15"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1">
          <div className="min-w-0 flex-1">
            <CopiloteChat compact={!expanded} />
          </div>
          {expanded && showHistory && (
            <aside className="hidden w-80 shrink-0 overflow-y-auto border-l border-border bg-muted/20 p-4 lg:block">
              <ActionHistory />
            </aside>
          )}
        </div>
      </div>
    </>
  );
}
