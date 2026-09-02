import { createFileRoute } from "@tanstack/react-router";
import { FileDown, FilePlus2, Globe, Link2, MessageCircle, Send, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  EmptyState,
  Pagination,
  Pill,
  RightDrawer,
  SortableTh,
  TableSkeleton,
} from "@/components/apro/bits";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  formatMAD,
  orders as seedOrders,
  quotes as seedQuotes,
  type Order,
  type Quote,
  type QuoteStatus,
} from "@/lib/apro-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/devis")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search["q"] === "string" ? (search["q"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Devis & Commandes IA — APRO Hygiène" },
      {
        name: "description",
        content:
          "Demandes de devis PDF envoyés par l'IA et commandes passées par WhatsApp ou via le site web.",
      },
      { property: "og:title", content: "Devis & Commandes IA — APRO Hygiène" },
      {
        property: "og:description",
        content: "Devis PDF générés par l'IA et commandes APRO Hygiène.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DevisPage,
});

const statusTone: Record<QuoteStatus, string> = {
  Brouillon: "neutral",
  Envoyé: "info",
  "En attente": "warning",
  Accepté: "success",
  Refusé: "error",
  Expiré: "error",
};

type SortKey = "client" | "ref" | "amount" | "date";

function DevisPage() {
  return (
    <Tabs defaultValue="devis" className="space-y-5">
      <TabsList>
        <TabsTrigger value="devis">Demandes de devis PDF</TabsTrigger>
        <TabsTrigger value="commandes">Commandes WhatsApp & site web</TabsTrigger>
      </TabsList>
      <TabsContent value="devis">
        <DevisTab />
      </TabsContent>
      <TabsContent value="commandes">
        <CommandesTab />
      </TabsContent>
    </Tabs>
  );
}

function DevisTab() {
  const { q: searchQ } = Route.useSearch();
  const [items, setItems] = useState<Quote[]>(seedQuotes);
  const [status, setStatus] = useState("all");
  const [client, setClient] = useState(searchQ ?? "");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "date",
    dir: "desc",
  });
  const [selected, setSelected] = useState<Quote | null>(null);
  const [draft, setDraft] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loadingPage, setLoadingPage] = useState(false);

  // Recherche globale (header) → filtre client
  useEffect(() => {
    if (searchQ !== undefined) setClient(searchQ);
  }, [searchQ]);

  const rows = useMemo(() => {
    const term = client.trim().toLowerCase();
    const out = items.filter(
      (q) =>
        (status === "all" || q.status === status) &&
        (!term || q.client.toLowerCase().includes(term) || q.ref.toLowerCase().includes(term)) &&
        (!from || q.date >= from) &&
        (!to || q.date <= to),
    );
    return out.sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      if (sort.key === "amount") return (a.amount - b.amount) * dir;
      return String(a[sort.key]).localeCompare(String(b[sort.key])) * dir;
    });
  }, [items, status, client, from, to, sort]);

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageRows = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Retour à la page 1 quand les filtres changent
  useEffect(() => {
    setPage(1);
  }, [status, client, from, to, pageSize]);

  const goToPage = (p: number) => {
    const next = Math.min(Math.max(1, p), pageCount);
    if (next === currentPage) return;
    setLoadingPage(true);
    setPage(next);
    window.setTimeout(() => setLoadingPage(false), 260);
  };

  const toggleSort = (key: SortKey) =>
    setSort((s) => ({ key, dir: s.key === key && s.dir === "asc" ? "desc" : "asc" }));

  const openQuote = (q: Quote) => {
    setSelected(q);
    setDraft(q.email);
  };

  const createQuote = (quote: Quote) => {
    setItems((prev) => [quote, ...prev]);
    setPage(1);
    toast.success(`Devis ${quote.ref} créé en brouillon`);
  };

  const deleteQuote = (id: string) => {
    const removed = items.find((q) => q.id === id);
    setItems((prev) => prev.filter((q) => q.id !== id));
    setSelected((s) => (s && s.id === id ? null : s));
    toast.success(`Devis ${removed?.ref ?? ""} supprimé`);
  };

  const toggleRelance = (id: string, value: boolean) => {
    setItems((prev) => prev.map((q) => (q.id === id ? { ...q, relance: value } : q)));
    setSelected((s) => (s && s.id === id ? { ...s, relance: value } : s));
    toast.success(value ? "Relance automatique activée" : "Relance automatique désactivée");
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="min-w-[200px] flex-1">
          <Label className="mb-1.5 text-xs">Client</Label>
          <Input
            value={client}
            onChange={(e) => setClient(e.target.value)}
            placeholder="Nom du client"
          />
        </div>
        <div>
          <Label className="mb-1.5 text-xs">Statut</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[170px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              {(Object.keys(statusTone) as QuoteStatus[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1.5 text-xs">Du</Label>
          <Input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-[160px]"
          />
        </div>
        <div>
          <Label className="mb-1.5 text-xs">Au</Label>
          <Input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-[160px]"
          />
        </div>
        <NewQuoteDialog onCreate={createQuote} />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead className="border-b border-border bg-muted/60">
              <tr>
                <SortableTh
                  label="Client"
                  active={sort.key === "client"}
                  dir={sort.dir}
                  onClick={() => toggleSort("client")}
                />
                <SortableTh
                  label="Référence"
                  active={sort.key === "ref"}
                  dir={sort.dir}
                  onClick={() => toggleSort("ref")}
                />
                <SortableTh
                  label="Montant"
                  active={sort.key === "amount"}
                  dir={sort.dir}
                  onClick={() => toggleSort("amount")}
                />
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                  Statut
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                  Sync Odoo
                </th>
                <SortableTh
                  label="Date"
                  active={sort.key === "date"}
                  dir={sort.dir}
                  onClick={() => toggleSort("date")}
                />
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                  Relance auto
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            {!loadingPage && (
              <tbody>
                {pageRows.map((q, i) => (
                  <tr
                    key={q.id}
                    onClick={() => openQuote(q)}
                    className={cn(
                      "cursor-pointer border-b border-border transition-colors hover:bg-accent-soft",
                      i % 2 === 1 && "bg-muted/30",
                    )}
                  >
                    <td className="px-4 py-3 font-medium text-foreground">{q.client}</td>
                    <td className="px-4 py-3 text-muted-foreground">{q.ref}</td>
                    <td className="px-4 py-3 font-semibold text-foreground">
                      {formatMAD(q.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <Pill tone={statusTone[q.status]}>{q.status}</Pill>
                    </td>
                    <td className="px-4 py-3">
                      <Pill
                        tone={
                          q.sync === "Synchronisé"
                            ? "success"
                            : q.sync === "Erreur"
                              ? "error"
                              : "warning"
                        }
                      >
                        {q.sync}
                      </Pill>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(q.date).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <Switch checked={q.relance} onCheckedChange={(v) => toggleRelance(q.id, v)} />
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        aria-label={`Envoyer le devis PDF ${q.ref}`}
                        onClick={() =>
                          toast.success(`Devis PDF ${q.ref} généré et envoyé à ${q.client}`)
                        }
                        className="press mr-2 rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:border-accent hover:text-accent"
                      >
                        <FileDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Supprimer le devis ${q.ref}`}
                        onClick={() => deleteQuote(q.id)}
                        className="press rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
        {loadingPage && (
          <div className="p-4">
            <TableSkeleton rows={Math.min(pageSize, 6)} cols={7} />
          </div>
        )}
        {!loadingPage && rows.length === 0 && (
          <div className="p-6">
            <EmptyState
              title="Aucun devis"
              message="Aucun devis ne correspond à vos filtres. Ajustez la recherche ou créez un devis."
            />
          </div>
        )}
        {rows.length > 0 && (
          <Pagination
            page={currentPage}
            pageSize={pageSize}
            total={rows.length}
            onPageChange={goToPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </div>

      <RightDrawer open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        {selected && (
          <div className="flex h-full flex-col">
            <div className="border-b border-border px-6 py-5">
              <p className="text-xs text-muted-foreground">{selected.ref}</p>
              <h2 className="text-lg font-semibold text-foreground">{selected.client}</h2>
              <div className="mt-2 flex gap-2">
                <Pill tone={statusTone[selected.status]}>{selected.status}</Pill>
                <Pill
                  tone={
                    selected.sync === "Synchronisé"
                      ? "success"
                      : selected.sync === "Erreur"
                        ? "error"
                        : "warning"
                  }
                >
                  Odoo · {selected.sync}
                </Pill>
              </div>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
              <div>
                <p className="mb-2 text-xs font-semibold text-muted-foreground">Lignes du devis</p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground">
                      <th className="py-2 text-left">Produit</th>
                      <th className="py-2 text-right">Qté</th>
                      <th className="py-2 text-right">PU</th>
                      <th className="py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.lines.map((l, i) => (
                      <tr
                        key={i}
                        className={cn("border-b border-border", i % 2 === 1 && "bg-muted/40")}
                      >
                        <td className="py-2 pr-2">{l.product}</td>
                        <td className="py-2 text-right">{l.qty}</td>
                        <td className="py-2 text-right">{formatMAD(l.unit)}</td>
                        <td className="py-2 text-right font-medium">{formatMAD(l.qty * l.unit)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-3 text-right text-sm font-bold text-foreground">
                  Total : {formatMAD(selected.amount)}
                </p>
              </div>

              <div className="rounded-lg bg-muted p-3 text-sm">
                <p className="font-medium text-foreground">{selected.contact}</p>
                <p className="text-muted-foreground">{selected.phone}</p>
                <button
                  type="button"
                  onClick={() => toast.success("Ouverture de la fiche Odoo")}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                >
                  <Link2 className="h-3 w-3" /> Voir dans Odoo
                </button>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Relance automatique</p>
                  <p className="text-xs text-muted-foreground">Relance à J+3 si pas de réponse</p>
                </div>
                <Switch
                  checked={selected.relance}
                  onCheckedChange={(v) => toggleRelance(selected.id, v)}
                />
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold text-muted-foreground">
                  Email de relance rédigé par l'IA
                </p>
                <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={9} />
              </div>
            </div>

            <div className="border-t border-border px-6 py-4">
              <Button
                className="w-full"
                onClick={() => toast.success("Email approuvé et envoyé au client")}
              >
                <Send className="h-4 w-4" /> Approuver et envoyer
              </Button>
            </div>
          </div>
        )}
      </RightDrawer>
    </div>
  );
}

const catalogue = [
  { id: "des", label: "Désinfectant surfaces 5L", price: 285 },
  { id: "sol", label: "Nettoyant sol industriel 20L", price: 1020 },
  { id: "pap", label: "Papier hygiénique pro (colis 36)", price: 420 },
];

function NewQuoteDialog({ onCreate }: { onCreate: (q: Quote) => void }) {
  const [open, setOpen] = useState(false);
  const [clientName, setClientName] = useState("");
  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState(10);
  const [unit, setUnit] = useState(285);
  const [error, setError] = useState<string | null>(null);

  const clients = Array.from(new Set(seedQuotes.map((q) => q.client)));

  const submit = () => {
    if (!clientName || !productId) {
      setError("Sélectionnez un client et un produit.");
      return;
    }
    if (qty <= 0 || unit <= 0) {
      setError("La quantité et le prix unitaire doivent être supérieurs à 0.");
      return;
    }
    const product = catalogue.find((c) => c.id === productId)!;
    const source = seedQuotes.find((q) => q.client === clientName);
    const quote: Quote = {
      ...(source as Quote),
      id: `q-${Date.now()}`,
      ref: `DEV-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      client: clientName,
      amount: qty * unit,
      status: "Brouillon",
      sync: "En attente",
      date: new Date().toISOString().slice(0, 10),
      relance: false,
      lines: [{ product: product.label, qty, unit }],
    };
    onCreate(quote);
    setOpen(false);
    setError(null);
    setClientName("");
    setProductId("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="press">
          <FilePlus2 className="h-4 w-4" /> Créer un devis
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Créer un devis</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="mb-1.5 text-xs">Client</Label>
            <Select value={clientName} onValueChange={setClientName}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 text-xs">Produit (catalogue Odoo)</Label>
            <Select
              value={productId}
              onValueChange={(v) => {
                setProductId(v);
                const p = catalogue.find((c) => c.id === v);
                if (p) setUnit(p.price);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un produit" />
              </SelectTrigger>
              <SelectContent>
                {catalogue.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.label} — {c.price} MAD
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5 text-xs">Quantité</Label>
              <Input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
              />
            </div>
            <div>
              <Label className="mb-1.5 text-xs">Prix unitaire (MAD)</Label>
              <Input
                type="number"
                min={1}
                value={unit}
                onChange={(e) => setUnit(Number(e.target.value))}
              />
            </div>
          </div>
          <p className="text-right text-sm font-semibold text-foreground">
            Total : {formatMAD(qty * unit)}
          </p>
          {error && (
            <p className="animate-pop rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
              {error}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button className="press" onClick={submit}>
            Créer le devis
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CommandesTab() {
  const [items, setItems] = useState<Order[]>(seedOrders);
  const [channel, setChannel] = useState("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const rows = useMemo(
    () =>
      items.filter(
        (o) =>
          (channel === "all" || o.channel === channel) &&
          (o.client.toLowerCase().includes(query.toLowerCase()) ||
            o.ref.toLowerCase().includes(query.toLowerCase())),
      ),
    [items, channel, query],
  );

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageRows = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const advance = (o: Order) => {
    const next: Order["status"] =
      o.status === "Reçue" ? "En préparation" : o.status === "En préparation" ? "Livrée" : o.status;
    if (next === o.status) {
      toast.error("Cette commande ne peut plus changer de statut");
      return;
    }
    setItems((prev) => prev.map((x) => (x.id === o.id ? { ...x, status: next } : x)));
    toast.success(`Commande ${o.ref} → ${next}`);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-soft">
      <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder="Rechercher un client ou une commande…"
          className="min-w-[220px] flex-1"
        />
        <Select
          value={channel}
          onValueChange={(v) => {
            setChannel(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[190px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les canaux</SelectItem>
            <SelectItem value="WhatsApp">WhatsApp</SelectItem>
            <SelectItem value="Site Web">Site Web</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {rows.length === 0 ? (
        <div className="p-6">
          <EmptyState
            title="Aucune commande"
            message="Aucune commande WhatsApp ou site web ne correspond à ces filtres."
          />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="border-b border-border bg-muted/60">
                <tr>
                  {[
                    "Commande",
                    "Client",
                    "Canal",
                    "Contenu",
                    "Montant",
                    "Date",
                    "Statut",
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
                {pageRows.map((o, i) => (
                  <tr
                    key={o.id}
                    className={cn(
                      "border-b border-border transition-colors hover:bg-accent-soft",
                      i % 2 === 1 && "bg-muted/30",
                    )}
                  >
                    <td className="px-4 py-3 font-medium text-foreground">{o.ref}</td>
                    <td className="px-4 py-3 text-muted-foreground">{o.client}</td>
                    <td className="px-4 py-3">
                      <Pill tone={o.channel === "WhatsApp" ? "success" : "info"}>
                        {o.channel === "WhatsApp" ? (
                          <MessageCircle className="h-3 w-3" />
                        ) : (
                          <Globe className="h-3 w-3" />
                        )}
                        {o.channel}
                      </Pill>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{o.items}</td>
                    <td className="px-4 py-3 font-semibold text-foreground">
                      {formatMAD(o.amount)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(o.date).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3">
                      <Pill
                        tone={
                          o.status === "Livrée"
                            ? "success"
                            : o.status === "Annulée"
                              ? "error"
                              : o.status === "En préparation"
                                ? "warning"
                                : "info"
                        }
                      >
                        {o.status}
                      </Pill>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="press"
                        onClick={() => advance(o)}
                      >
                        Faire avancer
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
  );
}
