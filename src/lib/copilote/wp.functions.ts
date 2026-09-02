import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Couche d'exécution WordPress réelle.
 * Les appels passent par la passerelle connecteur Lovable vers l'API REST WordPress
 * du site du client. Si aucun site n'est connecté, la fonction renvoie
 * { connected: false } et l'appelant bascule sur l'espace de démonstration local.
 */

const GATEWAY_URL = "https://connector-gateway.lovable.dev/wordpress";

const input = z.object({
  action: z.enum([
    "status",
    "list_pages",
    "list_posts",
    "list_media",
    "get_page",
    "update_page",
    "create_page",
    "delete_page",
    "publish_page",
    "upload_media",
    "replace_image",
  ]),
  page: z.string().optional(),
  id: z.number().optional(),
  title: z.string().optional(),
  content: z.string().optional(),
  search: z.string().optional(),
  replace: z.string().optional(),
  fileName: z.string().optional(),
  fileData: z.string().optional().describe("data URL base64 du fichier envoyé"),
});

export type WpInput = z.infer<typeof input>;

export type WpOutcome = {
  connected: boolean;
  ok: boolean;
  text: string;
  table?: { label: string; value: string }[];
  rows?: { headers: string[]; data: string[][] };
};

type Keys = { lovable: string; connection: string };

function keys(): Keys | null {
  const lovable = process.env["LOVABLE_API_KEY"];
  const connection = process.env["WORDPRESS_API_KEY"];
  if (!lovable || !connection) return null;
  return { lovable, connection };
}

async function wp(k: Keys, path: string, init?: RequestInit) {
  const res = await fetch(`${GATEWAY_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${k.lovable}`,
      "X-Connection-Api-Key": k.connection,
      ...(init?.headers ?? {}),
    },
  });
  const body = await res.text();
  if (!res.ok) {
    throw new Error(`[${res.status}] ${body.slice(0, 400)}`);
  }
  return body ? (JSON.parse(body) as unknown) : null;
}

type WpPost = {
  id: number;
  slug: string;
  status: string;
  link?: string;
  modified?: string;
  date?: string;
  title?: { rendered?: string };
  content?: { rendered?: string; raw?: string };
  source_url?: string;
  media_details?: unknown;
};

const stripTags = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

async function findPage(k: Keys, query: string) {
  const list = (await wp(k, `/pages?per_page=100&status=publish,draft&context=edit`)) as WpPost[];
  const q = norm(query || "accueil");
  return (
    list.find((p) => norm(p.title?.rendered ?? "") === q || norm(p.slug) === q) ??
    list.find((p) => norm(p.title?.rendered ?? "").includes(q) || norm(p.slug).includes(q)) ??
    list[0]
  );
}

function pageContent(p: WpPost) {
  return p.content?.raw ?? p.content?.rendered ?? "";
}

async function uploadMedia(k: Keys, fileName: string, fileData: string) {
  const base64 = fileData.includes(",") ? fileData.split(",")[1]! : fileData;
  const mime = /^data:([^;]+);/.exec(fileData)?.[1] ?? "image/jpeg";
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const media = (await wp(k, "/media", {
    method: "POST",
    headers: {
      "Content-Type": mime,
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
    body: bytes,
  })) as WpPost;
  return media;
}

export const wpAction = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => input.parse(raw))
  .handler(async ({ data }): Promise<WpOutcome> => {
    const k = keys();
    if (!k) {
      return {
        connected: false,
        ok: false,
        text: "Aucun site WordPress n'est connecté à la plateforme pour le moment.",
      };
    }

    try {
      switch (data.action) {
        case "status": {
          const me = (await wp(k, "/users/me?context=edit")) as { name?: string; slug?: string };
          return {
            connected: true,
            ok: true,
            text: "Site WordPress connecté et accessible.",
            table: [{ label: "Compte", value: me?.name ?? me?.slug ?? "—" }],
          };
        }

        case "list_pages": {
          const pages = (await wp(k, "/pages?per_page=50&status=publish,draft")) as WpPost[];
          return {
            connected: true,
            ok: true,
            text: `${pages.length} page(s) sur le site :`,
            rows: {
              headers: ["Page", "Adresse", "Statut", "Mise à jour"],
              data: pages.map((p) => [
                stripTags(p.title?.rendered ?? "—"),
                `/${p.slug}`,
                p.status,
                (p.modified ?? "").slice(0, 10),
              ]),
            },
          };
        }

        case "list_posts": {
          const posts = (await wp(k, "/posts?per_page=50&status=publish,draft")) as WpPost[];
          return {
            connected: true,
            ok: true,
            text: `${posts.length} article(s) sur le site :`,
            rows: {
              headers: ["Titre", "Statut", "Date"],
              data: posts.map((p) => [
                stripTags(p.title?.rendered ?? "—"),
                p.status,
                (p.date ?? "").slice(0, 10),
              ]),
            },
          };
        }

        case "list_media": {
          const media = (await wp(k, "/media?per_page=50")) as WpPost[];
          return {
            connected: true,
            ok: true,
            text: `${media.length} média(s) dans la bibliothèque :`,
            rows: {
              headers: ["Fichier", "Titre", "Adresse"],
              data: media.map((m) => [
                (m.source_url ?? "").split("/").pop() ?? "—",
                stripTags(m.title?.rendered ?? "—"),
                m.source_url ?? "—",
              ]),
            },
          };
        }

        case "get_page": {
          const p = await findPage(k, data.page ?? "");
          if (!p) return { connected: true, ok: false, text: "Page introuvable sur le site." };
          const html = pageContent(p);
          const img = /<img[^>]+src="([^"]+)"/i.exec(html)?.[1];
          return {
            connected: true,
            ok: true,
            text: `Contenu actuel de la page « ${stripTags(p.title?.rendered ?? "")} » :`,
            table: [
              { label: "Adresse", value: `/${p.slug}` },
              { label: "Statut", value: p.status },
              { label: "Texte", value: stripTags(html).slice(0, 900) || "—" },
              { label: "Image principale", value: img ?? "aucune" },
            ],
          };
        }

        case "update_page": {
          const p = await findPage(k, data.page ?? "");
          if (!p) return { connected: true, ok: false, text: "Page introuvable sur le site." };
          let html = pageContent(p);
          let before = "";
          if (data.search) {
            before = data.search;
            if (!html.includes(data.search)) {
              return {
                connected: true,
                ok: false,
                text: `Le texte « ${data.search} » n'a pas été trouvé sur la page « ${stripTags(p.title?.rendered ?? "")} ».`,
              };
            }
            html = html.split(data.search).join(data.replace ?? "");
          } else if (data.content) {
            before = stripTags(html).slice(0, 200);
            html = data.content;
          }
          const payload: Record<string, unknown> = { content: html };
          if (data.title) payload["title"] = data.title;
          await wp(k, `/pages/${p.id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          return {
            connected: true,
            ok: true,
            text: `Texte mis à jour sur la page « ${stripTags(p.title?.rendered ?? "")} ».`,
            table: [
              { label: "Page", value: `/${p.slug}` },
              { label: "Avant", value: before || "—" },
              { label: "Après", value: data.replace ?? stripTags(html).slice(0, 200) },
            ],
          };
        }

        case "create_page": {
          const created = (await wp(k, "/pages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: data.title ?? "Nouvelle page",
              content: data.content ?? "",
              status: "draft",
            }),
          })) as WpPost;
          return {
            connected: true,
            ok: true,
            text: `Page créée en brouillon : « ${data.title} ».`,
            table: [
              { label: "Adresse", value: `/${created.slug}` },
              { label: "Statut", value: created.status },
            ],
          };
        }

        case "delete_page": {
          const p = await findPage(k, data.page ?? "");
          if (!p) return { connected: true, ok: false, text: "Page introuvable sur le site." };
          await wp(k, `/pages/${p.id}?force=false`, { method: "DELETE" });
          return {
            connected: true,
            ok: true,
            text: `Page supprimée (mise à la corbeille) : « ${stripTags(p.title?.rendered ?? "")} ».`,
          };
        }

        case "publish_page": {
          const p = await findPage(k, data.page ?? "");
          if (!p) return { connected: true, ok: false, text: "Page introuvable sur le site." };
          await wp(k, `/pages/${p.id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "publish" }),
          });
          return { connected: true, ok: true, text: `Page publiée : « ${stripTags(p.title?.rendered ?? "")} ».` };
        }

        case "upload_media": {
          if (!data.fileData) return { connected: true, ok: false, text: "Aucun fichier reçu." };
          const media = await uploadMedia(k, data.fileName ?? "image.jpg", data.fileData);
          return {
            connected: true,
            ok: true,
            text: "Fichier envoyé dans la bibliothèque du site.",
            table: [{ label: "Adresse", value: media.source_url ?? "—" }],
          };
        }

        case "replace_image": {
          if (!data.fileData) return { connected: true, ok: false, text: "Aucune image reçue dans la conversation." };
          const p = await findPage(k, data.page ?? "");
          if (!p) return { connected: true, ok: false, text: "Page introuvable sur le site." };
          const html = pageContent(p);
          const current = /<img[^>]+src="([^"]+)"/i.exec(html)?.[1];
          if (!current) {
            return {
              connected: true,
              ok: false,
              text: `La page « ${stripTags(p.title?.rendered ?? "")} » ne contient pas d'image remplaçable dans son contenu.`,
            };
          }
          const media = await uploadMedia(k, data.fileName ?? "image.jpg", data.fileData);
          const next = html.split(current).join(media.source_url ?? current);
          await wp(k, `/pages/${p.id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: next }),
          });
          return {
            connected: true,
            ok: true,
            text: `Image remplacée sur la page « ${stripTags(p.title?.rendered ?? "")} ».`,
            table: [
              { label: "Ancienne image", value: current },
              { label: "Nouvelle image", value: media.source_url ?? "—" },
            ],
          };
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { connected: true, ok: false, text: humanize(message) };
    }
    return { connected: true, ok: false, text: "Action non reconnue." };
  });

/** Traduit une erreur technique WordPress en explication compréhensible. */
function humanize(message: string): string {
  if (message.includes("[401]") || message.includes("[403]"))
    return "Je n'ai pas pu effectuer la modification : le compte WordPress connecté n'a pas les droits nécessaires sur ce contenu. Vérifiez le rôle de l'utilisateur (Éditeur ou Administrateur) puis reconnectez le site.";
  if (message.includes("[404]") || message.includes("rest_no_route"))
    return "Le site répond mais l'API n'est pas joignable à cette adresse. Vérifiez que les permaliens WordPress sont bien activés.";
  if (message.includes("[429]"))
    return "Le site a temporairement limité les requêtes. Réessayez dans quelques instants.";
  if (message.startsWith("[5"))
    return "Le site WordPress a rencontré une erreur interne. Réessayez, puis vérifiez l'état du serveur si le problème persiste.";
  return `Je n'ai pas pu terminer l'opération sur le site. Détail technique : ${message}`;
}
