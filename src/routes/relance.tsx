import { createFileRoute } from "@tanstack/react-router";
import { BellRing, CheckCircle2, CircleSlash, Clock, HelpCircle, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { EmptyState, Pagination, Pill, SectionCard } from "@/components/apro/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  formatMAD,
  relanceDays as seedDays,
  relanceDefaults,
  relanceItems as seedItems,
  type RelanceItem,
  type RelanceReply,
} from "@/lib/apro-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/relance")({
  head: () => ({
    meta: [
      { title: "Relance IA — APRO Hygiène" },
      {
        name: "description",
        content:
          "Configuration des relances de paiement automatiques et suivi des réponses clients (oui, non, sans réponse).",
      },
      { property: "og:title", content: "Relance IA — APRO Hygiène" },
      {
        property: "og:description",
        content: "Relances de paiement pilotées par l'IA chez APRO Hygiène.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RelancePage,
});

const replyMeta: Record<RelanceReply, { label: string; tone: string; icon: typeof CheckCircle2 }> =
  {
    oui: { label: "Oui — va payer", tone: "success", icon: CheckCircle2 },
    non: { label: "Non — refuse", tone: "error", icon: CircleSlash },
    aucune: { label: "Aucune réponse", tone: "warning", icon: HelpCircle },
  };

function RelancePage() {
  return (
    <Tabs defaultValue="suivi" className="space-y-5">
      <TabsList>
        <TabsTrigger value="suivi">Suivi des relances</TabsTrigger>
        <TabsTrigger value="config">Configuration</TabsTrigger>
      </TabsList>
      <TabsContent value="suivi">
        <SuiviTab />
      </TabsContent>
      <TabsContent value="config">
        <ConfigTab />
      </TabsContent>
    </Tabs>
  );
}

function SuiviTab() {
  const [items, setItems] = useState<RelanceItem[]>(seedItems);
  const [filter, setFilter] = useState<"all" | RelanceReply>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const rows = useMemo(
    () =>
      items.filter(
        (r) =>
          (filter === "all" || r.reply === filter) &&
          (r.client.toLowerCase().includes(query.toLowerCase()) ||
            r.ref.toLowerCase().includes(query.toLowerCase())),
      ),
    [items, filter, query],
  );

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageRows = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const setReply = (id: string, reply: RelanceReply) => {
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, reply } : r)));
    toast.success(`Réponse client enregistrée : ${replyMeta[reply].label}`);
  };

  const relaunch = (r: RelanceItem) => {
    setItems((prev) =>
      prev.map((x) =>
        x.id === r.id
          ? { ...x, sent: x.sent + 1, lastSentAt: new Date().toISOString().slice(0, 10) }
          : x,
      ),
    );
    toast.success(`Relance envoyée à ${r.client} (${r.channel})`);
  };

  const totals = {
    oui: items.filter((i) => i.reply === "oui").reduce((s, i) => s + i.amount, 0),
    non: items.filter((i) => i.reply === "non").reduce((s, i) => s + i.amount, 0),
    aucune: items.filter((i) => i.reply === "aucune").reduce((s, i) => s + i.amount, 0),
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        {(["oui", "non", "aucune"] as RelanceReply[]).map((k) => {
          const m = replyMeta[k];
          return (
            <button
              key={k}
              type="button"
              onClick={() => {
                setFilter((f) => (f === k ? "all" : k));
                setPage(1);
              }}
              className={cn(
                "card-glow accent-topline rounded-xl border border-border bg-card p-5 text-left",
                filter === k && "border-accent",
              )}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">{m.label}</p>
                <m.icon className="h-4 w-4 text-accent" />
              </div>
              <p className="mt-3 text-2xl font-bold tracking-tight text-foreground">
                {formatMAD(totals[k])}
              </p>
              <Pill tone={m.tone} className="mt-2">
                {items.filter((i) => i.reply === k).length} dossier(s)
              </Pill>
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-soft">
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Rechercher un client ou une facture…"
            className="min-w-[220px] flex-1"
          />
          <Select
            value={filter}
            onValueChange={(v) => {
              setFilter(v as typeof filter);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[190px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les réponses</SelectItem>
              <SelectItem value="oui">Oui — va payer</SelectItem>
              <SelectItem value="non">Non — refuse</SelectItem>
              <SelectItem value="aucune">Aucune réponse</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {rows.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="Aucune relance"
              message="Aucun dossier ne correspond à ces filtres."
              icon={<BellRing className="h-6 w-6" />}
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-sm">
                <thead className="border-b border-border bg-muted/60">
                  <tr>
                    {[
                      "Client",
                      "Facture",
                      "Montant dû",
                      "Échéance",
                      "Relances",
                      "Prochaine",
                      "Réponse client",
                      "Action",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((r, i) => (
                    <tr
                      key={r.id}
                      className={cn(
                        "border-b border-border transition-colors hover:bg-accent-soft",
                        i % 2 === 1 && "bg-muted/30",
                      )}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{r.client}</p>
                        <p className="text-xs text-muted-foreground">{r.note}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{r.ref}</td>
                      <td className="px-4 py-3 font-semibold text-foreground">
                        {formatMAD(r.amount)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(r.dueDate).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-4 py-3">
                        <Pill tone={r.sent >= relanceDefaults.maxRelances ? "error" : "info"}>
                          {r.sent}/{relanceDefaults.maxRelances}
                        </Pill>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{r.nextAt}</td>
                      <td className="px-4 py-3">
                        <Select
                          value={r.reply}
                          onValueChange={(v) => setReply(r.id, v as RelanceReply)}
                        >
                          <SelectTrigger className="h-8 w-[170px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="oui">Oui — va payer</SelectItem>
                            <SelectItem value="non">Non — refuse</SelectItem>
                            <SelectItem value="aucune">Aucune réponse</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="press"
                          onClick={() => relaunch(r)}
                        >
                          <Send className="h-3 w-3" /> Relancer
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={currentPage}
              pageSize={pageSize}
              total={rows.length}
              onPageChange={(p) => setPage(Math.min(Math.max(1, p), pageCount))}
              onPageSizeChange={(s) => {
                setPageSize(s);
                setPage(1);
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}

function ConfigTab() {
  const [days, setDays] = useState(seedDays);
  const [maxRelances, setMaxRelances] = useState(relanceDefaults.maxRelances);
  const [waitBeforeFirst, setWaitBeforeFirst] = useState(relanceDefaults.waitBeforeFirst);
  const [daysBetween, setDaysBetween] = useState(relanceDefaults.daysBetween);
  const [error, setError] = useState<string | null>(null);

  const save = () => {
    if (maxRelances < 1 || waitBeforeFirst < 0 || daysBetween < 1) {
      setError("Vérifiez les valeurs : au moins 1 relance et 1 jour entre deux relances.");
      return;
    }
    if (!days.some((d) => d.enabled)) {
      setError("Activez au moins un jour de relance.");
      return;
    }
    setError(null);
    toast.success("Configuration des relances enregistrée");
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
      <SectionCard
        title="Jours et heures de relance"
        description="L'IA n'enverra des relances que dans ces créneaux"
      >
        <ul className="space-y-2">
          {days.map((d, i) => (
            <li
              key={d.day}
              className={cn(
                "flex flex-wrap items-center gap-3 rounded-xl border border-border p-3 transition-colors",
                !d.enabled && "opacity-60",
              )}
            >
              <Switch
                checked={d.enabled}
                onCheckedChange={(v) =>
                  setDays((prev) => prev.map((x, j) => (j === i ? { ...x, enabled: v } : x)))
                }
                aria-label={`Activer ${d.day}`}
              />
              <span className="w-24 text-sm font-medium text-foreground">{d.day}</span>
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="time"
                  value={d.from}
                  disabled={!d.enabled}
                  onChange={(e) =>
                    setDays((prev) =>
                      prev.map((x, j) => (j === i ? { ...x, from: e.target.value } : x)),
                    )
                  }
                  className="h-9 w-[120px]"
                />
                <span className="text-xs text-muted-foreground">→</span>
                <Input
                  type="time"
                  value={d.to}
                  disabled={!d.enabled}
                  onChange={(e) =>
                    setDays((prev) =>
                      prev.map((x, j) => (j === i ? { ...x, to: e.target.value } : x)),
                    )
                  }
                  className="h-9 w-[120px]"
                />
              </div>
            </li>
          ))}
        </ul>
      </SectionCard>

      <div className="space-y-5">
        <SectionCard title="Cadence des relances">
          <div className="space-y-4">
            <div>
              <Label className="mb-1.5 text-xs">Nombre maximum de relances</Label>
              <Input
                type="number"
                min={1}
                value={maxRelances}
                onChange={(e) => setMaxRelances(Number(e.target.value))}
              />
            </div>
            <div>
              <Label className="mb-1.5 text-xs">Jours d'attente avant la 1ʳᵉ relance</Label>
              <Input
                type="number"
                min={0}
                value={waitBeforeFirst}
                onChange={(e) => setWaitBeforeFirst(Number(e.target.value))}
              />
            </div>
            <div>
              <Label className="mb-1.5 text-xs">Jours entre chaque relance</Label>
              <Input
                type="number"
                min={1}
                value={daysBetween}
                onChange={(e) => setDaysBetween(Number(e.target.value))}
              />
            </div>
            {error && <p className="text-xs font-medium text-destructive">{error}</p>}
            <Button className="press w-full" onClick={save}>
              Enregistrer la configuration
            </Button>
          </div>
        </SectionCard>

        <SectionCard title="Aperçu du scénario">
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li>
              1. Facture échue → attente de{" "}
              <strong className="text-foreground">{waitBeforeFirst} jour(s)</strong>.
            </li>
            <li>
              2. Relance envoyée pendant les créneaux actifs ({days.filter((d) => d.enabled).length}{" "}
              jour(s)/semaine).
            </li>
            <li>
              3. Répétition tous les{" "}
              <strong className="text-foreground">{daysBetween} jour(s)</strong>, maximum{" "}
              <strong className="text-foreground">{maxRelances}</strong> fois.
            </li>
            <li>4. Réponse client enregistrée : oui, non, ou aucune réponse.</li>
          </ol>
        </SectionCard>
      </div>
    </div>
  );
}
