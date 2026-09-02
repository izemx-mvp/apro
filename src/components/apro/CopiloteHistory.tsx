import { CheckCircle2, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCopiloteStore } from "@/lib/copilote/store";
import { cn } from "@/lib/utils";

/** Journal des actions exécutées par le Copilote IA (traçabilité). */
export function ActionHistory() {
  const { history, clearHistory } = useCopiloteStore();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">Historique des actions</p>
        {history.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearHistory}>
            Vider
          </Button>
        )}
      </div>

      {history.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Aucune action encore exécutée. Les créations, modifications, suppressions et mises à jour du
          site apparaîtront ici.
        </p>
      ) : (
        <ul className="space-y-2">
          {history.map((h) => (
            <li
              key={h.id}
              className={cn(
                "rounded-xl border p-3",
                h.status === "ok" ? "border-border bg-card" : "border-destructive/30 bg-destructive/5",
              )}
            >
              <div className="flex items-center gap-2">
                {h.status === "ok" ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <TriangleAlert className="h-3.5 w-3.5 text-destructive" />
                )}
                <p className="text-xs font-semibold text-foreground">{h.title}</p>
                <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                  {h.scope}
                </span>
              </div>
              <p className="mt-1.5 text-[11px] break-words text-muted-foreground">{h.detail}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">
                {h.at} · {h.author}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
