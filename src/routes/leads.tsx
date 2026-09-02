import { createFileRoute } from "@tanstack/react-router";
import {
  Archive,
  CheckCircle2,
  Columns3,
  MessageCircle,
  Globe,
  Rows3,
  Search,
  UserPlus,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { EmptyState, Pagination, Pill, RightDrawer } from "@/components/apro/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { leadColumns, leads as seedLeads, type Lead, type LeadStatus } from "@/lib/apro-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/leads")({
  head: () => ({
    meta: [
      { title: "Leads & Qualification IA — APRO Hygiène" },
      {
        name: "description",
        content: "Pipeline de leads WhatsApp et site web, scoring IA et qualification vers Odoo.",
      },
      { property: "og:title", content: "Leads & Qualification IA — APRO Hygiène" },
      {
        property: "og:description",
        content: "Kanban et tableau de qualification des prospects APRO Hygiène.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LeadsPage,
});

function LeadsPage() {
  const [items, setItems] = useState<Lead[]>(seedLeads);
  const [channel, setChannel] = useState("all");
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Lead | null>(null);
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const filtered = useMemo(
    () =>
      items.filter(
        (l) =>
          (channel === "all" || l.channel === channel) &&
          (status === "all" || l.status === status) &&
          l.company.toLowerCase().includes(query.toLowerCase()),
      ),
    [items, channel, status, query],
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageRows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const move = (id: string, next: LeadStatus, message: string) => {
    setItems((prev) => prev.map((l) => (l.id === id ? { ...l, status: next } : l)));
    setSelected(null);
    toast.success(message);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Rechercher une société…"
            className="pl-9"
          />
        </div>
        <Select
          value={channel}
          onValueChange={(v) => {
            setChannel(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="Canal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les canaux</SelectItem>
            <SelectItem value="WhatsApp">WhatsApp</SelectItem>
            <SelectItem value="Site Web">Site Web</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[190px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            {leadColumns.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/50 p-1">
          {(
            [
              { id: "kanban", label: "Kanban", icon: Columns3 },
              { id: "table", label: "Tableau", icon: Rows3 },
            ] as const
          ).map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setView(v.id)}
              aria-pressed={view === v.id}
              className={cn(
                "press inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                view === v.id
                  ? "bg-card text-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <v.icon className="h-3.5 w-3.5" /> {v.label}
            </button>
          ))}
        </div>
        <Button
          className="press"
          onClick={() => toast.success("Formulaire de nouveau lead ouvert")}
        >
          <UserPlus className="h-4 w-4" /> Nouveau lead
        </Button>
      </div>

      {view === "kanban" ? (
        <div className="grid gap-4 lg:grid-cols-4">
          {leadColumns.map((col) => {
            const cards = filtered.filter((l) => l.status === col.id);
            return (
              <div key={col.id} className="rounded-xl border border-border bg-muted/40 p-3">
                <div className="mb-3 flex items-center justify-between px-1">
                  <h2 className="text-sm font-semibold text-foreground">{col.label}</h2>
                  <Pill
                    tone={
                      col.id === "qualifie" ? "success" : col.id === "hors-sujet" ? "error" : "info"
                    }
                  >
                    {cards.length}
                  </Pill>
                </div>
                <div className="space-y-3">
                  {cards.length === 0 ? (
                    <EmptyState
                      title="Aucun lead"
                      message="Aucun lead ne correspond à ces filtres dans cette colonne."
                    />
                  ) : (
                    cards.map((lead) => (
                      <button
                        key={lead.id}
                        type="button"
                        onClick={() => setSelected(lead)}
                        className="card-glow w-full rounded-xl border border-border bg-card p-3 text-left"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-foreground">{lead.company}</p>
                          <Pill tone={lead.channel === "WhatsApp" ? "success" : "info"}>
                            {lead.channel === "WhatsApp" ? (
                              <MessageCircle className="h-3 w-3" />
                            ) : (
                              <Globe className="h-3 w-3" />
                            )}
                            {lead.channel}
                          </Pill>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{lead.contact}</p>
                        <p className="mt-2 text-xs font-medium text-accent">{lead.interest}</p>
                        <p className="mt-2 text-[11px] text-muted-foreground">
                          Capturé le {new Date(lead.capturedAt).toLocaleDateString("fr-FR")}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-soft">
          {filtered.length === 0 ? (
            <div className="p-6">
              <EmptyState title="Aucun lead" message="Aucun lead ne correspond à ces filtres." />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-sm">
                  <thead className="border-b border-border bg-muted/60">
                    <tr>
                      {[
                        "Société",
                        "Contact",
                        "Canal",
                        "Intérêt",
                        "Score",
                        "Statut",
                        "Capturé le",
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
                    {pageRows.map((lead, i) => (
                      <tr
                        key={lead.id}
                        onClick={() => setSelected(lead)}
                        className={cn(
                          "cursor-pointer border-b border-border transition-colors hover:bg-accent-soft",
                          i % 2 === 1 && "bg-muted/30",
                        )}
                      >
                        <td className="px-4 py-3 font-medium text-foreground">{lead.company}</td>
                        <td className="px-4 py-3 text-muted-foreground">{lead.contact}</td>
                        <td className="px-4 py-3">
                          <Pill tone={lead.channel === "WhatsApp" ? "success" : "info"}>
                            {lead.channel}
                          </Pill>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{lead.interest}</td>
                        <td className="px-4 py-3 font-semibold text-foreground">
                          {lead.score}/100
                        </td>
                        <td className="px-4 py-3">
                          <Pill
                            tone={
                              lead.status === "qualifie"
                                ? "success"
                                : lead.status === "hors-sujet"
                                  ? "error"
                                  : "info"
                            }
                          >
                            {leadColumns.find((c) => c.id === lead.status)?.label}
                          </Pill>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(lead.capturedAt).toLocaleDateString("fr-FR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                page={currentPage}
                pageSize={pageSize}
                total={filtered.length}
                onPageChange={(p) => setPage(Math.min(Math.max(1, p), pageCount))}
                onPageSizeChange={(s) => {
                  setPageSize(s);
                  setPage(1);
                }}
              />
            </>
          )}
        </div>
      )}

      <RightDrawer open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        {selected && (
          <div className="flex h-full flex-col">
            <div className="border-b border-border px-6 py-5">
              <p className="text-xs text-muted-foreground">{selected.id}</p>
              <h2 className="text-lg font-semibold text-foreground">{selected.company}</h2>
              <p className="text-sm text-muted-foreground">
                {selected.contact} · {selected.channel}
              </p>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Score de qualification
                  </p>
                  <span className="text-sm font-bold text-foreground">{selected.score}/100</span>
                </div>
                <Progress value={selected.score} className="mt-2" />
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold text-muted-foreground">Résumé IA</p>
                <p className="rounded-lg bg-muted p-3 text-sm text-foreground">
                  {selected.summary}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold text-muted-foreground">
                  Intérêt produit détecté
                </p>
                <Pill tone="primary">{selected.interest}</Pill>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold text-muted-foreground">
                  Action recommandée
                </p>
                <p className="rounded-lg border border-accent/40 bg-accent-soft p-3 text-sm text-foreground">
                  {selected.recommendation}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold text-muted-foreground">
                  Historique de conversation
                </p>
                <div className="space-y-2">
                  {selected.conversation.map((m, i) => (
                    <div
                      key={i}
                      className={cn(
                        "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                        m.from === "client"
                          ? "bg-muted text-foreground"
                          : "ml-auto bg-primary text-primary-foreground",
                      )}
                    >
                      <p>{m.text}</p>
                      <p className="mt-1 text-[10px] opacity-70">{m.at}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 border-t border-border px-6 py-4">
              <Button
                className="flex-1"
                onClick={() =>
                  move(selected.id, "qualifie", "Lead qualifié · création du compte Odoo lancée")
                }
              >
                <CheckCircle2 className="h-4 w-4" /> Marquer qualifié
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => move(selected.id, "hors-sujet", "Lead archivé comme hors sujet")}
              >
                <Archive className="h-4 w-4" /> Hors sujet
              </Button>
            </div>
          </div>
        )}
      </RightDrawer>
    </div>
  );
}
