import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowUpRight,
  BellRing,
  FileDown,
  Info,
  ShoppingCart,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { EmptyState, Pill, SectionCard, StatusDot } from "@/components/apro/bits";
import { Skeleton } from "@/components/ui/skeleton";
import { activity30d, formatMAD, orders, priorityActions, relanceItems } from "@/lib/apro-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard IA — APRO Hygiène Back-office" },
      {
        name: "description",
        content:
          "Vue centrale : leads du jour, devis en attente, commandes et état de la synchronisation Odoo.",
      },
      { property: "og:title", content: "Dashboard IA — APRO Hygiène Back-office" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { property: "og:description", content: "Pilotage commercial APRO Hygiène en temps réel." },
    ],
  }),
  component: Dashboard,
});

const enCours = orders.filter((o) => o.status !== "Livrée" && o.status !== "Annulée");
const impayes = relanceItems.filter((r) => r.reply !== "oui");

const kpis = [
  {
    label: "Leads actifs aujourd'hui",
    value: "18",
    delta: "+4 vs hier",
    icon: Users,
    tone: "info" as const,
  },
  {
    label: "Demandes de devis PDF",
    value: "7",
    delta: "envoyés par l'IA cette semaine",
    icon: FileDown,
    tone: "warning" as const,
  },
  {
    label: "Commandes WhatsApp & web",
    value: String(enCours.length),
    delta: formatMAD(enCours.reduce((s, o) => s + o.amount, 0)),
    icon: ShoppingCart,
    tone: "primary" as const,
  },
  {
    label: "Relances IA en cours",
    value: String(impayes.length),
    delta: `${formatMAD(impayes.reduce((s, r) => s + r.amount, 0))} à recouvrer`,
    icon: BellRing,
    tone: "error" as const,
  },
];

function Dashboard() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) =>
          loading ? (
            <Skeleton key={k.label} className="h-28 rounded-xl" />
          ) : (
            <div
              key={k.label}
              className="card-glow accent-topline rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-start justify-between">
                <p className="text-xs font-medium text-muted-foreground">{k.label}</p>
                <k.icon className="h-4 w-4 text-accent" />
              </div>
              <div className="mt-3 flex items-center gap-2">
                <p className="text-2xl font-bold tracking-tight text-foreground">{k.value}</p>
                {k.label.includes("Relances") && <StatusDot tone="error" pulse />}
              </div>
              <Pill tone={k.tone} className="mt-2">
                {k.delta}
              </Pill>
            </div>
          ),
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <SectionCard
          title="Activité des 30 derniers jours"
          description="Leads capturés · devis envoyés · commandes passées"
          className="xl:col-span-2"
        >
          {loading ? (
            <Skeleton className="h-72 w-full" />
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activity30d} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    interval={4}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                      fontSize: 12,
                      color: "var(--card-foreground)",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="leads"
                    name="Leads"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="devis"
                    name="Devis"
                    stroke="var(--chart-2)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="commandes"
                    name="Commandes"
                    stroke="var(--chart-4)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Actions prioritaires" description="À traiter en priorité aujourd'hui">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : priorityActions.length === 0 ? (
            <EmptyState
              title="Rien à traiter"
              message="Toutes les actions prioritaires ont été traitées."
            />
          ) : (
            <ul className="space-y-3">
              {priorityActions.map((a, i) => (
                <li
                  key={i}
                  className="flex gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/60"
                >
                  <div className="mt-0.5">
                    {a.severity === "error" ? (
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    ) : a.severity === "warning" ? (
                      <AlertTriangle className="h-4 w-4 text-warning" />
                    ) : (
                      <Info className="h-4 w-4 text-accent" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <SectionCard title="Raccourcis">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { to: "/leads" as const, label: "Qualifier un lead", icon: UserPlus },
            { to: "/devis" as const, label: "Envoyer un devis PDF", icon: FileDown },
            { to: "/relance" as const, label: "Suivre les relances", icon: BellRing },
          ].map((s) => (
            <Link
              key={s.to}
              to={s.to}
              className="card-glow flex items-center justify-between rounded-xl border border-border bg-card p-4"
            >
              <span className="flex items-center gap-3 text-sm font-medium text-foreground">
                <s.icon className="h-4 w-4 text-accent" /> {s.label}
              </span>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
