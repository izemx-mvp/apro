import type { ChatTransport, UIMessage, UIMessageChunk } from "ai";

import type { AiToolName } from "./ai-tools";

/**
 * Transport local du Copilote : interprète la demande en français et déclenche
 * les mêmes outils que le modèle, à partir des données de démonstration.
 * Aucun appel réseau, aucune clé API nécessaire.
 */

type Intent = { tool: AiToolName; args: Record<string, unknown>; reply: string };

const norm = (t: string) =>
  t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const has = (t: string, ...words: string[]) => words.some((w) => t.includes(w));

function entityOf(t: string): string | null {
  if (has(t, "client", "societe", "entreprise")) return "client";
  if (has(t, "produit", "article", "stock", "rupture", "catalogue produit")) return "produit";
  if (has(t, "lead", "prospect", "opportunit")) return "lead";
  if (has(t, "devis", "proposition")) return "devis";
  if (has(t, "commande", "bon de livraison", "livraison")) return "commande";
  if (has(t, "relance", "impaye", "recouvrement")) return "relance";
  return null;
}

/** Extrait un nom entre guillemets, après « nommé/appelé », ou en fin de phrase. */
function nameOf(raw: string): string {
  const quoted = raw.match(/[«"']\s*([^«»"']{2,60})\s*[»"']/);
  if (quoted?.[1]) return quoted[1].trim();
  const named = raw.match(/(?:nomm[ée]e?|appel[ée]e?|intitul[ée]e?|pour|de)\s+([A-Za-zÀ-ÿ0-9&'’\-. ]{2,50})$/i);
  if (named?.[1]) return named[1].trim();
  const tail = raw.trim().split(/\s+/).slice(-3).join(" ");
  return tail.replace(/[?.!]/g, "").trim();
}

function pageOf(t: string, raw: string): string {
  for (const p of ["accueil", "a propos", "à propos", "catalogue", "contact", "secteurs", "blog", "services"]) {
    if (t.includes(norm(p))) return p;
  }
  const quoted = raw.match(/[«"']\s*([^«»"']{2,40})\s*[»"']/);
  return quoted?.[1]?.trim() ?? "accueil";
}

export function detectIntent(raw: string, hasUpload: boolean): Intent | null {
  const t = norm(raw);

  // ─── Site web ───
  if (has(t, "site")) {
    if (has(t, "connect", "etat du site", "statut")) {
      return { tool: "wp_status", args: {}, reply: "Je vérifie l'état du site web." };
    }
  }
  if (hasUpload && has(t, "image", "photo", "banniere", "visuel", "remplace")) {
    return {
      tool: "wp_replace_image",
      args: { page: pageOf(t, raw), block: "bannière" },
      reply: "Je prépare le remplacement de l'image avec le fichier envoyé.",
    };
  }
  if (has(t, "mediatheque", "medias", "galerie", "bibliotheque")) {
    return { tool: "wp_list", args: { kind: "medias" }, reply: "Voici la médiathèque du site." };
  }
  if (has(t, "article", "blog") && has(t, "site", "liste", "quels", "affiche", "montre")) {
    return { tool: "wp_list", args: { kind: "articles" }, reply: "Voici les articles du site." };
  }
  if (has(t, "page")) {
    if (has(t, "supprime", "efface")) {
      return {
        tool: "wp_delete_page",
        args: { page: pageOf(t, raw) },
        reply: "Cette suppression doit être confirmée avant exécution.",
      };
    }
    if (has(t, "cree", "creer", "ajoute", "nouvelle")) {
      return {
        tool: "wp_create_page",
        args: { title: nameOf(raw), content: "Contenu à compléter." },
        reply: "Création de page prête, il ne manque que votre confirmation.",
      };
    }
    if (has(t, "publie", "publication", "mets en ligne")) {
      return {
        tool: "wp_publish",
        args: { page: pageOf(t, raw) },
        reply: "Publication prête, confirmez pour la mettre en ligne.",
      };
    }
    if (has(t, "quelles", "liste", "combien", "montre", "affiche", "contient")) {
      return { tool: "wp_list", args: { kind: "pages" }, reply: "Voici les pages du site." };
    }
    if (has(t, "modifie", "change", "remplace", "corrige", "titre", "texte")) {
      const value = raw.split(/\bpar\b/i)[1]?.trim();
      return {
        tool: "wp_update_text",
        args: { page: pageOf(t, raw), block: has(t, "titre") ? "titre" : "contenu", value: value || nameOf(raw) },
        reply: "Voici la modification proposée, à confirmer.",
      };
    }
    return { tool: "wp_get_page", args: { page: pageOf(t, raw) }, reply: "Voici l'aperçu de la page." };
  }

  // ─── Données plateforme ───
  if (has(t, "bilan", "statistique", "chiffre", "synthese", "resume", "activite", "ca ", "performance")) {
    return { tool: "get_stats", args: {}, reply: "Voici la synthèse de l'activité." };
  }

  const entity = entityOf(t);
  if (entity) {
    if (has(t, "supprime", "efface", "retire")) {
      return {
        tool: "delete_record",
        args: { entity, query: nameOf(raw) },
        reply: "Suppression prête : confirmez pour l'exécuter.",
      };
    }
    if (has(t, "cree", "creer", "ajoute", "nouveau", "nouvelle", "enregistre")) {
      return {
        tool: "create_record",
        args: { entity, name: nameOf(raw) },
        reply: "Création prête : vérifiez les informations puis confirmez.",
      };
    }
    if (has(t, "modifie", "change", "mets a jour", "met a jour", "corrige")) {
      const value = raw.split(/\b(?:par|en|à|a)\b/i).pop()?.trim() ?? "";
      const field = has(t, "email", "mail")
        ? "email"
        : has(t, "telephone", "tel")
          ? "phone"
          : has(t, "ville")
            ? "city"
            : has(t, "prix")
              ? "price"
              : has(t, "stock")
                ? "stock"
                : has(t, "statut")
                  ? "status"
                  : "name";
      return {
        tool: "update_record",
        args: { entity, query: nameOf(raw), field, value },
        reply: "Modification prête : confirmez pour l'appliquer.",
      };
    }
    if (has(t, "fiche", "details", "detail", "informations sur", "qui est")) {
      return { tool: "get_record", args: { entity, query: nameOf(raw) }, reply: "Voici la fiche demandée." };
    }
    const filter = has(t, "rupture", "critique", "faible")
      ? "rupture"
      : has(t, "casablanca")
        ? "casablanca"
        : has(t, "rabat")
          ? "rabat"
          : has(t, "marrakech")
            ? "marrakech"
            : undefined;
    return {
      tool: "list_records",
      args: filter ? { entity, filter } : { entity },
      reply: "Voici les enregistrements correspondants.",
    };
  }

  return null;
}

const FALLBACK = `Je peux consulter et modifier vos données (clients, produits, leads, devis, commandes, relances) et piloter le site web du client.
Essayez par exemple : « Montre-moi tous les clients », « Crée un client nommé Ahmed Benali », « Quelles pages contient le site web ? » ou « Bilan d'activité du moment ».`;

function textChunks(text: string): UIMessageChunk[] {
  const id = `t-${Math.random().toString(36).slice(2)}`;
  const words = text.split(/(\s+)/);
  return [
    { type: "text-start", id },
    ...words.map((w) => ({ type: "text-delta" as const, id, delta: w })),
    { type: "text-end", id },
  ];
}

function lastUserText(messages: UIMessage[]): string | null {
  const last = messages[messages.length - 1];
  if (!last || last.role !== "user") return null;
  return last.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join(" ")
    .trim();
}

function lastToolSummary(messages: UIMessage[]): string | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (!msg || msg.role !== "assistant") continue;
    for (let j = msg.parts.length - 1; j >= 0; j--) {
      const part = msg.parts[j] as unknown as { type: string; output?: { text?: string; ok?: boolean } };
      if (part?.type?.startsWith("tool-") && part.output?.text) return part.output.text;
    }
  }
  return null;
}

function hasUploadInLastMessage(messages: UIMessage[]): boolean {
  const last = messages[messages.length - 1];
  return !!last?.parts.some((p) => p.type === "file");
}

/** Transport de démonstration : réponses générées localement, sans appel réseau. */
export function createMockChatTransport(): ChatTransport<UIMessage> {
  return {
    sendMessages: async ({ messages }) => {
      const chunks: UIMessageChunk[] = [{ type: "start" }, { type: "start-step" }];
      const userText = lastUserText(messages);

      if (userText === null) {
        // Relance automatique après l'exécution d'un outil : simple récapitulatif.
        const summary = lastToolSummary(messages) ?? "C'est fait.";
        chunks.push(...textChunks(summary));
      } else {
        const intent = detectIntent(userText, hasUploadInLastMessage(messages));
        if (!intent) {
          chunks.push(...textChunks(FALLBACK));
        } else {
          chunks.push(...textChunks(intent.reply));
          chunks.push({
            type: "tool-input-available",
            toolCallId: `call-${Math.random().toString(36).slice(2)}`,
            toolName: intent.tool,
            input: intent.args,
          });
        }
      }

      chunks.push({ type: "finish-step" }, { type: "finish" });

      return new ReadableStream<UIMessageChunk>({
        async start(controller) {
          for (const chunk of chunks) {
            controller.enqueue(chunk);
            if (chunk.type === "text-delta") await new Promise((r) => setTimeout(r, 14));
          }
          controller.close();
        },
      });
    },
    reconnectToStream: async () => null,
  };
}
