import { formatMAD } from "@/lib/apro-data";
import type { AiToolName } from "./ai-tools";
import { isWriteTool } from "./ai-tools";
import type { CopiloteState } from "./store";
import { pagePreview, runTool, type ToolArgs, type ToolName, type ToolResult } from "./tools";

export type ExecCtx = {
  state: CopiloteState;
  update: (fn: (s: CopiloteState) => CopiloteState) => void;
  role: string;
  /** Dernier fichier envoyé dans la conversation. */
  upload?: { name: string; dataUrl: string } | null;
};

const s = (v: unknown) => (v === undefined || v === null ? undefined : String(v));

/** Résumé compact de l'état de l'application, injecté dans le contexte du modèle. */
export function buildContext(state: CopiloteState): string {
  const lines = [
    `Clients (${state.clients.length}) : ${state.clients.map((c) => `${c.name} [${c.city}]`).join(", ")}`,
    `Produits (${state.products.length}) : ${state.products.map((p) => p.name).join(", ")}`,
    `Leads (${state.leads.length}) : ${state.leads.map((l) => `${l.company} (${l.status})`).join(", ")}`,
    `Devis (${state.quotes.length}) : ${state.quotes.map((q) => `${q.ref} ${q.client} ${formatMAD(q.amount)}`).join(", ")}`,
    `Commandes (${state.orders.length}) : ${state.orders.map((o) => `${o.ref} ${o.client} ${o.status}`).join(", ")}`,
    `Relances (${state.relances.length}) : ${state.relances.map((r) => `${r.ref} ${r.client}`).join(", ")}`,
    `Site web (démonstration) — pages : ${state.wp.pages.map((p) => p.title).join(", ")}`,
  ];
  return lines.join("\n");
}

const localWpName: Partial<Record<AiToolName, ToolName>> = {
  wp_list: "wp_list",
  wp_update_text: "wp_update_text",
  wp_replace_image: "wp_replace_image",
  wp_create_page: "wp_create_page",
  wp_delete_page: "wp_delete_page",
  wp_publish: "wp_publish",
};

function localWpFallback(name: AiToolName, args: ToolArgs, ctx: ExecCtx): ToolResult {
  if (name === "wp_status") {
    return {
      ok: true,
      text: "Aucun site WordPress réel n'est connecté. Je travaille sur l'espace de démonstration interne.",
      table: [
        { label: "Site de démonstration", value: ctx.state.wp.url },
        { label: "Thème", value: ctx.state.wp.theme ?? "—" },
        { label: "Pages", value: String(ctx.state.wp.pages.length) },
        { label: "Articles", value: String(ctx.state.wp.posts.length) },
        { label: "Médias", value: String(ctx.state.wp.media.length) },
      ],
      gallery: ctx.state.wp.pages.map((p) => ({
        file: p.slug,
        title: p.title,
        ...(p.cover ? { src: p.cover } : {}),
        caption: `${p.status} · maj ${p.updatedAt}`,
      })),
    };
  }
  if (name === "wp_get_page") {
    const q = (args["page"] ?? "accueil").toLowerCase();
    const page =
      ctx.state.wp.pages.find((p) => p.title.toLowerCase().includes(q) || p.slug.includes(q)) ??
      ctx.state.wp.pages[0];
    if (!page) return { ok: false, text: "Page introuvable sur le site de démonstration." };
    return {
      ok: true,
      text: `Aperçu de la page « ${page.title} » (${ctx.state.wp.url}${page.slug}) :`,
      preview: pagePreview(ctx.state.wp.url, page),
    };
  }

  const mapped = localWpName[name];
  if (!mapped) return { ok: false, text: "Action indisponible sur l'espace de démonstration." };
  const localArgs: ToolArgs =
    name === "wp_replace_image" && ctx.upload
      ? { ...args, file: ctx.upload.name, src: ctx.upload.dataUrl }
      : args;
  return runTool(mapped, localArgs, ctx);
}

/** Exécute un outil demandé par l'IA : permissions → couche d'exécution → vérification. */
export async function executeTool(
  name: AiToolName,
  rawArgs: Record<string, unknown>,
  ctx: ExecCtx,
): Promise<ToolResult & { scope: "Odoo" | "Site web" | "Lecture" }> {
  const args: ToolArgs = {};
  for (const [k, v] of Object.entries(rawArgs ?? {})) {
    const val = s(v);
    if (val !== undefined) args[k] = val;
  }

  const isWp = name.startsWith("wp_");
  const scope: "Odoo" | "Site web" | "Lecture" = isWp
    ? "Site web"
    : isWriteTool(name)
      ? "Odoo"
      : "Lecture";

  if (isWriteTool(name) && ctx.role === "Lecteur") {
    return {
      ok: false,
      scope,
      text: "Vous n'avez pas les droits nécessaires pour effectuer cette action. Votre profil est en lecture seule.",
    };
  }

  if (!isWp) {
    return { ...runTool(name as ToolName, args, ctx), scope };
  }

  return { ...localWpFallback(name, args, ctx), scope };
}
