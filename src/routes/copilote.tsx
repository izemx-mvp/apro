import { createFileRoute } from "@tanstack/react-router";
import { Bot, CheckCircle2, Mic, Send, Settings2, TriangleAlert, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Pill, RightDrawer, SectionCard } from "@/components/apro/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { automationRules, automations, formatMAD } from "@/lib/apro-data";
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

type Msg = { from: "user" | "agent"; text: string; table?: { label: string; value: string }[] };

const initialMessages: Msg[] = [
  {
    from: "user",
    text: "Donne-moi le bilan des ventes du mois de juillet",
  },
  {
    from: "agent",
    text: "Voici le bilan des ventes de juillet 2026 extrait d'Odoo :",
    table: [
      { label: "Chiffre d'affaires", value: formatMAD(1284500) },
      { label: "Commandes validées", value: "47" },
      { label: "Panier moyen", value: formatMAD(27330) },
      { label: "Taux d'acceptation devis", value: "62 %" },
    ],
  },
];

function CopilotePage() {
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [input, setInput] = useState("");
  const [rules, setRules] = useState(automationRules);
  const [log, setLog] = useState<(typeof automations)[number] | null>(null);

  const send = () => {
    if (!input.trim()) return;
    const question = input.trim();
    setInput("");
    setMessages((m) => [...m, { from: "user", text: question }]);
    setTimeout(() => {
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
    }, 500);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <SectionCard
          title="Copilote Odoo"
          description="Posez une question ou dictez une commande vocale"
        >
          <div className="flex h-[380px] flex-col gap-4 overflow-y-auto pr-1">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex gap-3", m.from === "user" && "flex-row-reverse")}>
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    m.from === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-accent-soft text-accent",
                  )}
                >
                  {m.from === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div className={cn("max-w-[80%] space-y-2", m.from === "user" && "text-right")}>
                  <p
                    className={cn(
                      "inline-block rounded-lg px-3 py-2 text-sm",
                      m.from === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground",
                    )}
                  >
                    {m.text}
                  </p>
                  {m.table && (
                    <div className="overflow-hidden rounded-lg border border-border text-left">
                      <table className="w-full text-sm">
                        <tbody>
                          {m.table.map((r, j) => (
                            <tr
                              key={j}
                              className={cn(
                                "border-b border-border last:border-0",
                                j % 2 === 1 && "bg-muted/40",
                              )}
                            >
                              <td className="px-3 py-2 text-muted-foreground">{r.label}</td>
                              <td className="px-3 py-2 text-right font-semibold text-foreground">
                                {r.value}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ex : Vérifie le stock des produits de nettoyage sol"
            />
            <Button
              variant="outline"
              size="icon"
              aria-label="Commande vocale"
              onClick={() => toast.success("Écoute vocale activée…")}
            >
              <Mic className="h-4 w-4" />
            </Button>
            <Button size="icon" aria-label="Envoyer" onClick={send}>
              <Send className="h-4 w-4" />
            </Button>
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
