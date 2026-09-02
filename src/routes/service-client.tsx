import { createFileRoute } from "@tanstack/react-router";
import { Clock, Download, ExternalLink, FileText, Link2, Plus, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState, Pill, SectionCard } from "@/components/apro/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  documents as seedDocs,
  faqItems as seedFaq,
  openingHours as seedHours,
  socialLinks as seedSocial,
  type DocItem,
  type FaqItem,
} from "@/lib/apro-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/service-client")({
  head: () => ({
    meta: [
      { title: "Service Client IA — APRO Hygiène" },
      {
        name: "description",
        content:
          "Réseaux sociaux, FAQ, documents et horaires d'ouverture utilisés par l'agent IA de service client.",
      },
      { property: "og:title", content: "Service Client IA — APRO Hygiène" },
      {
        property: "og:description",
        content: "Sources de réponse de l'agent IA client d'APRO Hygiène.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ServiceClientPage,
});

function ServiceClientPage() {
  return (
    <Tabs defaultValue="reseaux" className="space-y-5">
      <TabsList>
        <TabsTrigger value="reseaux">Réseaux sociaux</TabsTrigger>
        <TabsTrigger value="faq">FAQ</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
        <TabsTrigger value="horaires">Horaires</TabsTrigger>
      </TabsList>

      <TabsContent value="reseaux">
        <SocialTab />
      </TabsContent>
      <TabsContent value="faq">
        <FaqTab />
      </TabsContent>
      <TabsContent value="documents">
        <DocsTab />
      </TabsContent>
      <TabsContent value="horaires">
        <HoursTab />
      </TabsContent>
    </Tabs>
  );
}

function SocialTab() {
  const [links, setLinks] = useState(seedSocial);
  const [network, setNetwork] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const add = () => {
    if (!network.trim() || !url.trim()) {
      setError("Indiquez le réseau et le lien.");
      return;
    }
    if (!/^https?:\/\//.test(url.trim())) {
      setError("Le lien doit commencer par http:// ou https://");
      return;
    }
    setLinks((p) => [
      ...p,
      {
        id: `s-${Date.now()}`,
        network: network.trim(),
        handle: url.trim().replace(/^https?:\/\//, ""),
        url: url.trim(),
        active: true,
      },
    ]);
    setNetwork("");
    setUrl("");
    setError(null);
    toast.success("Lien ajouté — l'agent IA pourra le partager");
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <SectionCard
        title="Liens partagés par l'agent IA"
        description="Actifs uniquement lorsqu'ils sont activés"
      >
        <ul className="space-y-3">
          {links.map((l) => (
            <li
              key={l.id}
              className="card-glow flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{l.network}</p>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
                >
                  {l.handle} <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Pill tone={l.active ? "success" : "neutral"}>
                  {l.active ? "Actif" : "Inactif"}
                </Pill>
                <Switch
                  checked={l.active}
                  aria-label={`Activer ${l.network}`}
                  onCheckedChange={(v) =>
                    setLinks((p) => p.map((x) => (x.id === l.id ? { ...x, active: v } : x)))
                  }
                />
                <button
                  type="button"
                  aria-label={`Supprimer ${l.network}`}
                  onClick={() => {
                    setLinks((p) => p.filter((x) => x.id !== l.id));
                    toast.success("Lien supprimé");
                  }}
                  className="press rounded-lg border border-border p-1.5 text-muted-foreground hover:border-destructive/40 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard title="Ajouter un réseau">
        <div className="space-y-3">
          <div>
            <Label className="mb-1.5 text-xs">Réseau</Label>
            <Input
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              placeholder="TikTok, YouTube…"
            />
          </div>
          <div>
            <Label className="mb-1.5 text-xs">Lien</Label>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
          </div>
          {error && <p className="text-xs font-medium text-destructive">{error}</p>}
          <Button className="press w-full" onClick={add}>
            <Link2 className="h-4 w-4" /> Ajouter le lien
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}

function FaqTab() {
  const [items, setItems] = useState<FaqItem[]>(seedFaq);
  const [editing, setEditing] = useState<FaqItem | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setEditing(null);
    setQuestion("");
    setAnswer("");
    setError(null);
  };

  const submit = () => {
    if (!question.trim() || !answer.trim()) {
      setError("La question et la réponse sont obligatoires.");
      return;
    }
    if (editing) {
      setItems((p) =>
        p.map((x) =>
          x.id === editing.id ? { ...x, question: question.trim(), answer: answer.trim() } : x,
        ),
      );
      toast.success("Question mise à jour");
    } else {
      setItems((p) => [
        { id: `f-${Date.now()}`, question: question.trim(), answer: answer.trim(), active: true },
        ...p,
      ]);
      toast.success("Question ajoutée à la FAQ");
    }
    reset();
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <SectionCard
        title="Questions fréquentes"
        description="Base de réponses utilisée par l'agent IA"
      >
        {items.length === 0 ? (
          <EmptyState
            title="FAQ vide"
            message="Ajoutez une première question pour alimenter l'agent IA."
          />
        ) : (
          <ul className="space-y-3">
            {items.map((f) => (
              <li key={f.id} className="card-glow rounded-xl border border-border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{f.question}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{f.answer}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Pill tone={f.active ? "success" : "neutral"}>
                      {f.active ? "Active" : "Inactive"}
                    </Pill>
                    <Switch
                      checked={f.active}
                      aria-label={`Activer « ${f.question} »`}
                      onCheckedChange={(v) =>
                        setItems((p) => p.map((x) => (x.id === f.id ? { ...x, active: v } : x)))
                      }
                    />
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditing(f);
                      setQuestion(f.question);
                      setAnswer(f.answer);
                    }}
                  >
                    Modifier
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setItems((p) => p.filter((x) => x.id !== f.id));
                      if (editing?.id === f.id) reset();
                      toast.success("Question supprimée");
                    }}
                  >
                    <Trash2 className="h-3 w-3" /> Supprimer
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard title={editing ? "Modifier la question" : "Nouvelle question"}>
        <div className="space-y-3">
          <div>
            <Label className="mb-1.5 text-xs">Question</Label>
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Livrez-vous le samedi ?"
            />
          </div>
          <div>
            <Label className="mb-1.5 text-xs">Réponse</Label>
            <Textarea
              rows={5}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Réponse de l'agent IA…"
            />
          </div>
          {error && <p className="text-xs font-medium text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button className="press flex-1" onClick={submit}>
              <Save className="h-4 w-4" /> {editing ? "Enregistrer" : "Ajouter"}
            </Button>
            {editing && (
              <Button variant="outline" onClick={reset}>
                Annuler
              </Button>
            )}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

function DocsTab() {
  const [docs, setDocs] = useState<DocItem[]>(seedDocs);
  const [name, setName] = useState("");

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <SectionCard
        title="Documents envoyés par l'agent IA"
        description="Catalogues, fiches techniques et CGV"
      >
        <ul className="space-y-3">
          {docs.map((d) => (
            <li
              key={d.id}
              className="card-glow flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  <FileText className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{d.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {d.type} · {d.size} · mis à jour le{" "}
                    {new Date(d.updatedAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Pill tone={d.active ? "success" : "neutral"}>
                  {d.active ? "Partagé" : "Masqué"}
                </Pill>
                <Switch
                  checked={d.active}
                  aria-label={`Partager ${d.name}`}
                  onCheckedChange={(v) =>
                    setDocs((p) => p.map((x) => (x.id === d.id ? { ...x, active: v } : x)))
                  }
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.success(`Téléchargement de « ${d.name} »`)}
                >
                  <Download className="h-3 w-3" />
                </Button>
                <button
                  type="button"
                  aria-label={`Supprimer ${d.name}`}
                  onClick={() => {
                    setDocs((p) => p.filter((x) => x.id !== d.id));
                    toast.success("Document supprimé");
                  }}
                  className="press rounded-lg border border-border p-1.5 text-muted-foreground hover:border-destructive/40 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard title="Ajouter un document">
        <div className="space-y-3">
          <div>
            <Label className="mb-1.5 text-xs">Nom du document</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Fiche technique gel 500ml"
            />
          </div>
          <Button
            className="press w-full"
            onClick={() => {
              if (!name.trim()) {
                toast.error("Indiquez un nom de document");
                return;
              }
              setDocs((p) => [
                {
                  id: `d-${Date.now()}`,
                  name: name.trim(),
                  type: "PDF",
                  size: "—",
                  updatedAt: new Date().toISOString().slice(0, 10),
                  url: "#",
                  active: true,
                },
                ...p,
              ]);
              setName("");
              toast.success("Document ajouté");
            }}
          >
            <Plus className="h-4 w-4" /> Ajouter
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}

function HoursTab() {
  const [hours, setHours] = useState(seedHours);

  return (
    <SectionCard
      title="Heures d'ouverture et de fermeture"
      description="Communiquées par l'agent IA et utilisées pour les réponses hors horaires"
    >
      <ul className="space-y-2">
        {hours.map((h, i) => (
          <li
            key={h.day}
            className={cn(
              "flex flex-wrap items-center gap-3 rounded-xl border border-border p-3 transition-colors",
              h.closed && "opacity-60",
            )}
          >
            <span className="w-28 text-sm font-medium text-foreground">{h.day}</span>
            <Switch
              checked={!h.closed}
              aria-label={`Ouvert le ${h.day}`}
              onCheckedChange={(v) =>
                setHours((p) => p.map((x, j) => (j === i ? { ...x, closed: !v } : x)))
              }
            />
            <span className="w-20 text-xs text-muted-foreground">
              {h.closed ? "Fermé" : "Ouvert"}
            </span>
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="time"
                aria-label={`Ouverture ${h.day}`}
                value={h.open}
                disabled={h.closed}
                onChange={(e) =>
                  setHours((p) => p.map((x, j) => (j === i ? { ...x, open: e.target.value } : x)))
                }
                className="h-9 w-[120px]"
              />
              <span className="text-xs text-muted-foreground">→</span>
              <Input
                type="time"
                aria-label={`Fermeture ${h.day}`}
                value={h.close}
                disabled={h.closed}
                onChange={(e) =>
                  setHours((p) => p.map((x, j) => (j === i ? { ...x, close: e.target.value } : x)))
                }
                className="h-9 w-[120px]"
              />
            </div>
          </li>
        ))}
      </ul>
      <Button className="press mt-4" onClick={() => toast.success("Horaires enregistrés")}>
        <Save className="h-4 w-4" /> Enregistrer les horaires
      </Button>
    </SectionCard>
  );
}
