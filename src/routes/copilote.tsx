import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Settings2, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Pill, RightDrawer, SectionCard } from "@/components/apro/bits";
import { CopiloteChat } from "@/components/apro/CopiloteChat";
import { ActionHistory } from "@/components/apro/CopiloteHistory";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { automationRules, automations } from "@/lib/apro-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/copilote")({
  head: () => ({
    meta: [
      { title: "Agent Copilote Odoo — APRO Hygiène" },
      {
        name: "description",
        content:
          "Assistant IA interne : bilans de ventes, contrôle de stock et automatisations Odoo.",
      },
      { property: "og:title", content: "Agent Copilote Odoo — APRO Hygiène" },
      {
        property: "og:description",
        content: "Copilote IA connecté à Odoo pour l'équipe APRO Hygiène.",
      },
    ],
  }),
  component: CopilotePage,
});

function CopilotePage() {
  const [rules, setRules] = useState(automationRules);
  const [log, setLog] = useState<(typeof automations)[number] | null>(null);

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <SectionCard
          title="Copilote IA — centre de commande"
          description="Consultez, créez, modifiez ou supprimez vos données et pilotez le site web du client en langage naturel"
        >
          <div className="h-[560px] overflow-hidden rounded-xl border border-border">
            <CopiloteChat />
          </div>
        </SectionCard>

        <SectionCard
          title="Actions automatisées Odoo"
          description="Historique des exécutions récentes"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-b border-border bg-muted/60">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                    Déclencheur
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                    Horodatage
                  </th>
                </tr>
              </thead>
              <tbody>
                {automations.map((a, i) => (
                  <tr
                    key={a.id}
                    onClick={() => setLog(a)}
                    className={cn(
                      "cursor-pointer border-b border-border transition-colors hover:bg-accent-soft",
                      i % 2 === 1 && "bg-muted/30",
                    )}
                  >
                    <td className="px-4 py-3 font-medium text-foreground">{a.type}</td>
                    <td className="px-4 py-3 text-muted-foreground">{a.trigger}</td>
                    <td className="px-4 py-3">
                      <Pill tone={a.status === "ok" ? "success" : "error"}>
                        {a.status === "ok" ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <TriangleAlert className="h-3 w-3" />
                        )}
                        {a.status === "ok" ? "Exécuté" : "Erreur"}
                      </Pill>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{a.at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>

      <div className="space-y-6">
        <SectionCard title="Actions du Copilote IA" description="Traçabilité des opérations exécutées">
          <ActionHistory />
        </SectionCard>

      <SectionCard title="Configurer les automatisations" description="Règles actives du copilote">
        <div className="space-y-3">
          {rules.map((r) => (
            <div key={r.id} className="rounded-lg border border-border p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-foreground">{r.name}</p>
                <Switch
                  checked={r.active}
                  onCheckedChange={(v) => {
                    setRules((prev) => prev.map((x) => (x.id === r.id ? { ...x, active: v } : x)));
                    toast.success(v ? "Règle activée" : "Règle désactivée");
                  }}
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Déclencheur : {r.trigger}</p>
              <p className="text-xs text-muted-foreground">Action : {r.action}</p>
              <div className="mt-2 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.success("Édition du déclencheur")}
                >
                  <Settings2 className="h-3 w-3" /> Déclencheur
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.success("Édition de l'action")}
                >
                  Action
                </Button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <RightDrawer open={!!log} onOpenChange={(v) => !v && setLog(null)}>
        {log && (
          <div className="space-y-4 px-6 py-5">
            <div>
              <h2 className="text-lg font-semibold text-foreground">{log.type}</h2>
              <p className="text-sm text-muted-foreground">{log.at}</p>
            </div>
            <Pill tone={log.status === "ok" ? "success" : "error"}>
              {log.status === "ok" ? "Exécuté" : "Erreur"}
            </Pill>
            <div>
              <p className="mb-2 text-xs font-semibold text-muted-foreground">Déclencheur</p>
              <p className="rounded-lg bg-muted p-3 text-sm text-foreground">{log.trigger}</p>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold text-muted-foreground">Journal complet</p>
              <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs whitespace-pre-wrap text-foreground">
                {log.log}
              </pre>
            </div>
          </div>
        )}
      </RightDrawer>
    </div>
  );
}
