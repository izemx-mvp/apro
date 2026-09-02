import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls, type UIMessage } from "ai";
import {
  AlertTriangle,
  BarChart3,
  Bot,
  Check,
  CheckCircle2,
  Globe,
  Image as ImageIcon,
  Loader2,
  type LucideIcon,
  PackageSearch,
  Paperclip,
  Send,
  Sparkles,
  Trash2,
  User,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import catalogueImg from "@/assets/wp/catalogue-produits.jpg";
import equipeImg from "@/assets/wp/equipe-apro.jpg";
import heroImg from "@/assets/wp/hero-accueil.jpg";
import hotellerieImg from "@/assets/wp/secteur-hotellerie.jpg";
import restaurationImg from "@/assets/wp/secteur-restauration.jpg";
import santeImg from "@/assets/wp/secteur-sante.jpg";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import {
  destructiveTools,
  isWriteTool,
  toolLabel,
  toolSteps,
  type AiToolName,
} from "@/lib/copilote/ai-tools";
import { buildContext, executeTool } from "@/lib/copilote/executor";
import { useCopiloteStore } from "@/lib/copilote/store";
import type { ToolResult } from "@/lib/copilote/tools";
import { cn } from "@/lib/utils";


type Upload = { name: string; dataUrl: string; type: string };

type Scenario = {
  prompt: string;
  title: string;
  hint: string;
  icon: LucideIcon;
  image: string;
  tone: "accent" | "primary" | "success" | "warning";
};

const SCENARIOS: Scenario[] = [
  {
    prompt: "Montre-moi tous les clients",
    title: "Portefeuille clients",
    hint: "Liste complète, encours et secteurs",
    icon: Users,
    image: equipeImg,
    tone: "primary",
  },
  {
    prompt: "Crée un client nommé Ahmed Benali",
    title: "Créer un client",
    hint: "Fiche créée après confirmation",
    icon: UserPlus,
    image: hotellerieImg,
    tone: "accent",
  },
  {
    prompt: "Quelles pages contient le site web ?",
    title: "Pages du site",
    hint: "Aperçu visuel des pages WordPress",
    icon: Globe,
    image: heroImg,
    tone: "success",
  },
  {
    prompt: "Affiche la médiathèque du site",
    title: "Médiathèque",
    hint: "Galerie d'images du site client",
    icon: ImageIcon,
    image: catalogueImg,
    tone: "accent",
  },
  {
    prompt: "Bilan d'activité du moment",
    title: "Bilan d'activité",
    hint: "Ventes, stock et alertes du jour",
    icon: BarChart3,
    image: santeImg,
    tone: "warning",
  },
  {
    prompt: "Quels produits sont en rupture de stock ?",
    title: "Alertes de stock",
    hint: "Produits sous le seuil critique",
    icon: PackageSearch,
    image: restaurationImg,
    tone: "warning",
  },
];

const toneRing: Record<Scenario["tone"], string> = {
  accent: "text-accent bg-accent-soft",
  primary: "text-primary bg-primary-soft",
  success: "text-success bg-success/10",
  warning: "text-warning bg-warning/10",
};


const readFile = (file: File) =>
  new Promise<Upload>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ name: file.name, dataUrl: String(reader.result), type: file.type });
    reader.onerror = () => reject(new Error("Lecture du fichier impossible"));
    reader.readAsDataURL(file);
  });

/** Fil de conversation du Copilote IA : lecture, écriture et pilotage du site web. */
export function CopiloteChat({ compact = false }: { compact?: boolean }) {
  const { state, update, pushHistory } = useCopiloteStore();
  const { user } = useAuth();
  const role = user?.role ?? "Administrateur";

  const [input, setInput] = useState("");
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [dragging, setDragging] = useState(false);
  const [pending, setPending] = useState<Record<string, boolean>>({});

  const lastUpload = useRef<Upload | null>(null);
  const ctxRef = useRef({ state, role });
  ctxRef.current = { state, role };
  const endRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: ({ messages }) => ({
          body: {
            messages,
            context: buildContext(ctxRef.current.state),
            role: ctxRef.current.role,
            wpConnected: false,
          },
        }),
      }),
    [],
  );

  const run = useCallback(
    async (name: AiToolName, args: Record<string, unknown>) => {
      const result = await executeTool(name, args, {
        state: ctxRef.current.state,
        update,
        role: ctxRef.current.role,
        upload: lastUpload.current,
      });
      pushHistory({
        title: toolLabel[name],
        detail: result.text,
        scope: result.scope,
        status: result.ok ? "ok" : "error",
        author: user?.name ?? "Utilisateur",
      });
      return result;
    },
    [pushHistory, update, user?.name],
  );

  const { messages, sendMessage, status, addToolResult, error } = useChat({
    transport,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    onToolCall: async ({ toolCall }) => {
      const name = toolCall.toolName as AiToolName;
      // Les écritures attendent la confirmation de l'utilisateur (carte d'action).
      if (isWriteTool(name)) return;
      const output = await run(name, toolCall.input as Record<string, unknown>);
      void addToolResult({ tool: name, toolCallId: toolCall.toolCallId, output });
    },
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, status]);

  const busy = status === "submitted" || status === "streaming";

  const confirm = async (name: AiToolName, toolCallId: string, args: Record<string, unknown>) => {
    setPending((p) => ({ ...p, [toolCallId]: true }));
    const output = await run(name, args);
    setPending((p) => ({ ...p, [toolCallId]: false }));
    void addToolResult({ tool: name, toolCallId, output });
  };

  const cancel = (name: AiToolName, toolCallId: string) => {
    void addToolResult({
      tool: name,
      toolCallId,
      output: { ok: false, text: "Action annulée par l'utilisateur.", scope: "Lecture" } as ToolResult & {
        scope: string;
      },
    });
  };

  const addFiles = async (files: FileList | File[] | null) => {
    if (!files) return;
    const read = await Promise.all(Array.from(files).slice(0, 3).map(readFile));
    setUploads((u) => [...u, ...read]);
    lastUpload.current = read[read.length - 1] ?? lastUpload.current;
  };

  const submit = () => {
    const text = input.trim();
    if ((!text && !uploads.length) || busy) return;
    const files = uploads.map((u) => ({
      type: "file" as const,
      mediaType: u.type || "image/jpeg",
      filename: u.name,
      url: u.dataUrl,
    }));
    void sendMessage({ text: text || "Voici le fichier.", files });
    setInput("");
    setUploads([]);
  };

  return (
    <div
      className="flex h-full min-h-0 flex-col"
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        void addFiles(e.dataTransfer.files);
      }}
    >
      <div className={cn("min-h-0 flex-1 space-y-4 overflow-y-auto p-4", compact ? "text-sm" : "")}>
        {messages.length === 0 && (
          <div className="space-y-5 py-4 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold text-foreground">Votre copilote opérationnel</p>
              <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
                Demandez une information, créez ou modifiez un enregistrement, ou pilotez le site web du
                client — en langage naturel.
              </p>
            </div>
            <div
              className={cn(
                "mx-auto grid max-w-3xl gap-3 text-left",
                compact ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
              )}
            >
              {SCENARIOS.map((s, i) => (
                <ScenarioCard
                  key={s.prompt}
                  scenario={s}
                  index={i}
                  disabled={busy}
                  onPick={() => void sendMessage({ text: s.prompt })}
                />
              ))}
            </div>
          </div>
        )}


        {messages.map((m) => (
          <MessageRow
            key={m.id}
            message={m}
            compact={compact}
            pending={pending}
            onConfirm={confirm}
            onCancel={cancel}
          />
        ))}

        {busy && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />
            Le copilote réfléchit…
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{error.message}</span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {messages.length > 0 && (
        <div className="border-t border-border/70 bg-muted/20 px-3 py-2">
          <div className="flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {SCENARIOS.map((s) => (
              <button
                key={s.prompt}
                type="button"
                disabled={busy}
                onClick={() => void sendMessage({ text: s.prompt })}
                className="press group flex shrink-0 items-center gap-2 rounded-full border border-border bg-card py-1 pr-3 pl-1 text-xs whitespace-nowrap text-muted-foreground transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
              >
                <img
                  src={s.image}
                  alt=""
                  aria-hidden
                  className="h-6 w-6 rounded-full object-cover ring-1 ring-border"
                />
                <span className="font-medium">{s.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={cn("border-t border-border p-3", dragging && "bg-accent-soft")}>

        {uploads.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {uploads.map((u, i) => (
              <div
                key={`${u.name}${i}`}
                className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 py-1 pr-1 pl-2 text-xs"
              >
                {u.type.startsWith("image/") && (
                  <img src={u.dataUrl} alt={u.name} className="h-7 w-7 rounded object-cover" />
                )}
                <span className="max-w-[140px] truncate">{u.name}</span>
                <button
                  type="button"
                  aria-label={`Retirer ${u.name}`}
                  onClick={() => setUploads((prev) => prev.filter((_, j) => j !== i))}
                  className="rounded p-1 hover:bg-muted"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/*,.pdf,.csv,.txt"
            className="hidden"
            onChange={(e) => void addFiles(e.target.files)}
          />
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 shrink-0"
            aria-label="Joindre un fichier"
            onClick={() => fileRef.current?.click()}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPaste={(e) => {
              const files = Array.from(e.clipboardData.files);
              if (files.length) void addFiles(files);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={1}
            placeholder="Écrivez, glissez une image, ou demandez une action…"
            className="max-h-32 min-h-10 flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button
            size="icon"
            className="h-10 w-10 shrink-0"
            aria-label="Envoyer"
            disabled={busy}
            onClick={submit}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <p className="mt-1.5 text-[10px] text-muted-foreground">
          Entrée pour envoyer · Maj + Entrée pour un retour à la ligne · glisser-déposer accepté
        </p>
      </div>
    </div>
  );
}

/* ─────────────── carte de scénario ─────────────── */

function ScenarioCard({
  scenario,
  index,
  disabled,
  onPick,
}: {
  scenario: Scenario;
  index: number;
  disabled: boolean;
  onPick: () => void;
}) {
  const Icon = scenario.icon;
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onPick}
      style={{ animationDelay: `${index * 55}ms` }}
      className="animate-rise card-glow group relative overflow-hidden rounded-2xl border border-border bg-card text-left disabled:opacity-60"
    >
      <div className="relative h-20 overflow-hidden">
        <img
          src={scenario.image}
          alt=""
          aria-hidden
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/55 to-transparent" />
        <span
          className={cn(
            "absolute bottom-2 left-3 flex h-8 w-8 items-center justify-center rounded-xl shadow-soft backdrop-blur",
            toneRing[scenario.tone],
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="space-y-0.5 px-3 pt-2 pb-3">
        <p className="text-sm font-semibold text-foreground">{scenario.title}</p>
        <p className="text-[11px] leading-snug text-muted-foreground">{scenario.hint}</p>
        <p className="pt-1 text-[11px] font-medium text-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          « {scenario.prompt} »
        </p>
      </div>
    </button>
  );
}


/* ─────────────── rendu d'un message ─────────────── */

type RowProps = {
  message: UIMessage;
  compact: boolean;
  pending: Record<string, boolean>;
  onConfirm: (name: AiToolName, id: string, args: Record<string, unknown>) => void;
  onCancel: (name: AiToolName, id: string) => void;
};

function MessageRow({ message, compact, pending, onConfirm, onCancel }: RowProps) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-primary text-primary-foreground" : "bg-accent-soft text-accent",
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className={cn("min-w-0 space-y-2", compact ? "max-w-[88%]" : "max-w-[80%]", isUser && "items-end")}>
        {message.parts.map((part, i) => {
          if (part.type === "text" && part.text.trim()) {
            return (
              <p
                key={i}
                className={cn(
                  "inline-block rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap",
                  isUser
                    ? "rounded-br-sm bg-primary text-primary-foreground"
                    : "rounded-bl-sm bg-muted text-foreground",
                )}
              >
                {part.text}
              </p>
            );
          }
          if (part.type === "file") {
            return part.mediaType?.startsWith("image/") ? (
              <img
                key={i}
                src={part.url}
                alt={part.filename ?? "Pièce jointe"}
                className="max-h-44 rounded-xl border border-border object-cover"
              />
            ) : (
              <p key={i} className="rounded-lg border border-border px-3 py-1.5 text-xs">
                {part.filename}
              </p>
            );
          }
          if (part.type.startsWith("tool-")) {
            const toolPart = part as unknown as {
              type: string;
              toolCallId: string;
              state: string;
              input?: Record<string, unknown>;
              output?: ToolResult;
            };
            const name = toolPart.type.replace("tool-", "") as AiToolName;
            return (
              <ToolCard
                key={toolPart.toolCallId}
                name={name}
                toolCallId={toolPart.toolCallId}
                state={toolPart.state}
                input={toolPart.input ?? {}}
                output={toolPart.output}
                busy={!!pending[toolPart.toolCallId]}
                onConfirm={onConfirm}
                onCancel={onCancel}
              />
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}

/* ─────────────── carte d'action ─────────────── */

const FIELD_LABELS: Record<string, string> = {
  entity: "Entité",
  query: "Enregistrement",
  field: "Champ",
  value: "Nouvelle valeur",
  name: "Nom",
  email: "E-mail",
  phone: "Téléphone",
  contact: "Contact",
  city: "Ville",
  address: "Adresse",
  price: "Prix",
  stock: "Stock",
  amount: "Montant",
  items: "Articles",
  description: "Description",
  interest: "Intérêt",
  page: "Page",
  block: "Élément",
  title: "Titre",
  content: "Contenu",
  search: "Texte actuel",
  file: "Fichier",
  kind: "Type",
};

function ToolCard({
  name,
  toolCallId,
  state,
  input,
  output,
  busy,
  onConfirm,
  onCancel,
}: {
  name: AiToolName;
  toolCallId: string;
  state: string;
  input: Record<string, unknown>;
  output?: ToolResult | undefined;
  busy: boolean;
  onConfirm: RowProps["onConfirm"];
  onCancel: RowProps["onCancel"];
}) {
  const destructive = destructiveTools.includes(name);
  const awaiting = isWriteTool(name) && !output && state !== "output-error";
  const steps = toolSteps[name] ?? [];

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border text-left transition-colors",
        output && !output.ok ? "border-destructive/40 bg-destructive/5" : "border-border bg-card",
      )}
    >
      <div className="flex items-center gap-2 border-b border-border/70 px-3 py-2">
        {output ? (
          output.ok ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          ) : (
            <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
          )
        ) : awaiting ? (
          destructive ? (
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          ) : (
            <Sparkles className="h-3.5 w-3.5 text-accent" />
          )
        ) : (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />
        )}
        <p className="text-xs font-semibold text-foreground">{toolLabel[name]}</p>
        {output && (
          <span
            className={cn(
              "ml-auto text-[10px] font-medium",
              output.ok ? "text-emerald-600" : "text-destructive",
            )}
          >
            {output.ok ? "✓ Terminé" : "Échec"}
          </span>
        )}
      </div>

      <div className="space-y-2 p-3">
        {(awaiting || busy) && (
          <div className="space-y-1.5">
            {Object.entries(input)
              .filter(([, v]) => v !== undefined && v !== "")
              .map(([k, v]) => (
                <div key={k} className="flex gap-3 text-xs">
                  <span className="w-28 shrink-0 text-muted-foreground">{FIELD_LABELS[k] ?? k}</span>
                  <span className="min-w-0 flex-1 font-medium break-words text-foreground">{String(v)}</span>
                </div>
              ))}
            {destructive && (
              <p className="rounded-lg bg-destructive/10 px-2.5 py-1.5 text-[11px] text-destructive">
                Cette action est irréversible. Confirmez pour l'exécuter.
              </p>
            )}
          </div>
        )}

        {busy && (
          <ul className="space-y-1 pt-1">
            {steps.map((s, i) => (
              <li key={s} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <Loader2
                  className="h-3 w-3 animate-spin text-accent"
                  style={{ animationDelay: `${i * 120}ms` }}
                />
                {s}
              </li>
            ))}
          </ul>
        )}

        {awaiting && !busy && (
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={() => onCancel(name, toolCallId)}>
              Annuler
            </Button>
            <Button
              size="sm"
              variant={destructive ? "destructive" : "default"}
              onClick={() => onConfirm(name, toolCallId, input)}
            >
              <Check className="h-3 w-3" />
              {destructive ? "Confirmer la suppression" : "Exécuter"}
            </Button>
          </div>
        )}

        {output && (
          <div className="space-y-2">
            <p className="text-xs text-foreground">{output.text}</p>
            {output.table && (
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-xs">
                  <tbody>
                    {output.table.map((r, j) => (
                      <tr key={j} className={cn("border-b border-border last:border-0", j % 2 === 1 && "bg-muted/40")}>
                        <td className="px-3 py-1.5 whitespace-nowrap text-muted-foreground">{r.label}</td>
                        <td className="px-3 py-1.5 text-right font-medium break-words text-foreground">
                          {r.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {output.rows && (
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-xs">
                  <thead className="bg-muted/60">
                    <tr>
                      {output.rows.headers.map((h) => (
                        <th key={h} className="px-3 py-2 text-left font-semibold text-muted-foreground">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {output.rows.data.map((row, j) => (
                      <tr key={j} className={cn("border-t border-border", j % 2 === 1 && "bg-muted/30")}>
                        {row.map((cell, c) => (
                          <td key={c} className="px-3 py-1.5 text-foreground">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {output.gallery && output.gallery.length > 0 && (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {output.gallery.map((m, j) => (
                  <figure
                    key={j}
                    className="overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md"
                  >
                    {m.src ? (
                      <img
                        src={m.src}
                        alt={m.title}
                        loading="lazy"
                        className="h-24 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-24 w-full items-center justify-center bg-muted text-[10px] font-medium text-muted-foreground">
                        {m.mime?.includes("pdf") ? "PDF" : "Fichier"}
                      </div>
                    )}
                    <figcaption className="space-y-0.5 px-2 py-1.5">
                      <p className="truncate text-[11px] font-medium text-foreground">{m.title}</p>
                      <p className="truncate text-[10px] text-muted-foreground">{m.caption ?? m.file}</p>
                    </figcaption>
                  </figure>
                ))}
              </div>
            )}
            {output.preview && (
              <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <div className="flex items-center gap-2 border-b border-border bg-muted/60 px-3 py-2">
                  <span className="flex gap-1">
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                  </span>
                  <span className="truncate rounded-md bg-background px-2 py-0.5 text-[10px] text-muted-foreground">
                    {output.preview.site}
                    {output.preview.slug === "/" ? "" : output.preview.slug}
                  </span>
                  <span
                    className={cn(
                      "ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium",
                      output.preview.status.startsWith("Publi")
                        ? "bg-success text-success-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {output.preview.status}
                  </span>
                </div>
                {output.preview.cover && (
                  <img
                    src={output.preview.cover}
                    alt={output.preview.title}
                    loading="lazy"
                    className="h-28 w-full object-cover"
                  />
                )}
                <div className="space-y-2 px-3 py-3">
                  <p className="text-sm font-semibold text-foreground">{output.preview.title}</p>
                  {output.preview.blocks.map((b, j) =>
                    b.type === "image" ? (
                      <div
                        key={j}
                        className={cn(
                          "overflow-hidden rounded-lg border",
                          b.changed ? "border-primary" : "border-border",
                        )}
                      >
                        {b.src ? (
                          <img src={b.src} alt={b.label} loading="lazy" className="h-24 w-full object-cover" />
                        ) : (
                          <div className="flex h-24 items-center justify-center bg-muted text-[10px] text-muted-foreground">
                            {b.value}
                          </div>
                        )}
                        <p className="px-2 py-1 text-[10px] text-muted-foreground">
                          {b.label} · {b.value}
                        </p>
                      </div>
                    ) : (
                      <div
                        key={j}
                        className={cn(
                          "rounded-lg border px-2 py-1.5",
                          b.changed ? "border-primary bg-accent-soft" : "border-border bg-muted/30",
                        )}
                      >
                        <p className="text-[10px] tracking-wide text-muted-foreground uppercase">{b.label}</p>
                        <p className="text-xs text-foreground">{b.value}</p>
                      </div>
                    ),
                  )}
                  {output.preview.updatedAt && (
                    <p className="text-[10px] text-muted-foreground">
                      Dernière mise à jour : {output.preview.updatedAt}
                    </p>
                  )}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
