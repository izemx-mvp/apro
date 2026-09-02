import { formatMAD } from "@/lib/apro-data";
import type { AiToolName } from "./ai-tools";
import { isWriteTool } from "./ai-tools";
import type { CopiloteState } from "./store";
import { runTool, type ToolArgs, type ToolName, type ToolResult } from "./tools";
import { wpAction } from "./wp.functions";

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
        { label: "Pages", value: String(ctx.state.wp.pages.length) },
        { label: "Articles", value: String(ctx.state.wp.posts.length) },
        { label: "Médias", value: String(ctx.state.wp.media.length) },
      ],
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
      text: `Contenu actuel de la page « ${page.title} » (démonstration) :`,
      table: [
        { label: "Adresse", value: page.slug },
        { label: "Statut", value: page.status },
        ...page.blocks.map((b) => ({ label: b.label, value: b.value })),
      ],
    };
  }
  const mapped = localWpName[name];
  if (!mapped) return { ok: false, text: "Action indisponible sur l'espace de démonstration." };
  return runTool(mapped, args, ctx);
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

  try {
    const result = await wpAction({ data: toWpInput(name, args, ctx) });
    if (!result.connected) {
      const fallback = localWpFallback(name, args, ctx);
      return {
        ...fallback,
        scope,
        text:
          name === "wp_status"
            ? fallback.text
            : `${fallback.text} (site WordPress non connecté : action appliquée à l'espace de démonstration)`,
      };
    }
    return { ok: result.ok, text: result.text, table: result.table, rows: result.rows, scope };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      scope,
      text: `Je n'ai pas pu joindre le site web. ${message}`,
    };
  }
}

type WpInputShape = Parameters<typeof wpAction>[0] extends { data: infer D } ? D : never;

function toWpInput(name: AiToolName, args: ToolArgs, ctx: ExecCtx): WpInputShape {
  const base = { page: args["page"], title: args["title"], content: args["content"] };
  switch (name) {
    case "wp_status":
      return { action: "status" } as WpInputShape;
    case "wp_list":
      return {
        action:
          args["kind"] === "articles" ? "list_posts" : args["kind"] === "medias" ? "list_media" : "list_pages",
      } as WpInputShape;
    case "wp_get_page":
      return { action: "get_page", page: args["page"] } as WpInputShape;
    case "wp_update_text": {
      const block = (args["block"] ?? "").toLowerCase();
      if (block.includes("titre") && !args["search"]) {
        return { action: "update_page", page: args["page"], title: args["value"] } as WpInputShape;
      }
      return {
        action: "update_page",
        page: args["page"],
        search: args["search"],
        replace: args["value"],
        content: args["search"] ? undefined : args["value"],
      } as WpInputShape;
    }
    case "wp_replace_image":
      return {
        action: "replace_image",
        page: args["page"],
        fileName: ctx.upload?.name ?? args["file"],
        fileData: ctx.upload?.dataUrl,
      } as WpInputShape;
    case "wp_create_page":
      return { action: "create_page", ...base } as WpInputShape;
    case "wp_delete_page":
      return { action: "delete_page", page: args["page"] } as WpInputShape;
    case "wp_publish":
      return { action: "publish_page", page: args["page"] } as WpInputShape;
    default:
      return { action: "status" } as WpInputShape;
  }
}
