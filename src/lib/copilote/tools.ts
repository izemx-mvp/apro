import { formatMAD, type Lead, type Order, type Quote, type RelanceItem } from "@/lib/apro-data";
import type { Client, Product, WpPage } from "./data";
import type { CopiloteState } from "./store";

export type EntityKind = "client" | "produit" | "lead" | "devis" | "commande" | "relance";

export type ToolName =
  | "list_records"
  | "get_record"
  | "create_record"
  | "update_record"
  | "delete_record"
  | "get_stats"
  | "wp_list"
  | "wp_update_text"
  | "wp_replace_image"
  | "wp_create_page"
  | "wp_delete_page"
  | "wp_publish"
  | "wp_connect";

export type ToolArgs = Record<string, string>;

export type ToolResult = {
  ok: boolean;
  text: string;
  table?: { label: string; value: string }[];
  rows?: { headers: string[]; data: string[][] };
};

export type ToolCtx = {
  state: CopiloteState;
  update: (fn: (s: CopiloteState) => CopiloteState) => void;
  role: string;
};

export const entityLabel: Record<EntityKind, string> = {
  client: "Client",
  produit: "Produit",
  lead: "Lead",
  devis: "Devis",
  commande: "Commande",
  relance: "Relance",
};

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const uid = (p: string) => `${p}${Date.now().toString().slice(-6)}`;
const today = () => new Date().toISOString().slice(0, 10);

/* ───────── recherche d'enregistrement ───────── */

type AnyRecord = Client | Product | Lead | Quote | Order | RelanceItem;

export function collection(state: CopiloteState, entity: EntityKind): AnyRecord[] {
  switch (entity) {
    case "client":
      return state.clients;
    case "produit":
      return state.products;
    case "lead":
      return state.leads;
    case "devis":
      return state.quotes;
    case "commande":
      return state.orders;
    case "relance":
      return state.relances;
  }
}

export function recordTitle(entity: EntityKind, r: AnyRecord): string {
  if (entity === "client") return (r as Client).name;
  if (entity === "produit") return (r as Product).name;
  if (entity === "lead") return `${(r as Lead).company} — ${(r as Lead).id}`;
  if (entity === "devis") return `${(r as Quote).ref} — ${(r as Quote).client}`;
  if (entity === "commande") return `${(r as Order).ref} — ${(r as Order).client}`;
  return `${(r as RelanceItem).ref} — ${(r as RelanceItem).client}`;
}

export function findRecord(state: CopiloteState, entity: EntityKind, query: string) {
  const q = norm(query);
  if (!q) return undefined;
  return collection(state, entity).find((r) => {
    const hay = norm(Object.values(r as Record<string, unknown>).filter((v) => typeof v === "string" || typeof v === "number").join(" "));
    return hay.includes(q) || q.includes(norm(recordTitle(entity, r).split(" — ")[0] ?? ""));
  });
}

function summarize(entity: EntityKind, r: AnyRecord): { label: string; value: string }[] {
  if (entity === "client") {
    const c = r as Client;
    return [
      { label: "Référence Odoo", value: c.ref },
      { label: "Contact", value: c.contact },
      { label: "E-mail", value: c.email },
      { label: "Téléphone", value: c.phone },
      { label: "Ville", value: c.city },
      { label: "Segment", value: c.segment },
      { label: "Conditions", value: c.paymentTerms },
      { label: "Encours", value: formatMAD(c.outstanding) },
      { label: "Actif", value: c.active ? "Oui" : "Non" },
    ];
  }
  if (entity === "produit") {
    const p = r as Product;
    return [
      { label: "Référence", value: p.ref },
      { label: "Catégorie", value: p.category },
      { label: "Prix de vente", value: formatMAD(p.price) },
      { label: "Coût", value: formatMAD(p.cost) },
      { label: "Stock", value: `${p.stock} ${p.unit.toLowerCase()}(s)` },
      { label: "Stock minimum", value: String(p.minStock) },
      { label: "Actif", value: p.active ? "Oui" : "Non" },
    ];
  }
  if (entity === "lead") {
    const l = r as Lead;
    return [
      { label: "Identifiant", value: l.id },
      { label: "Contact", value: l.contact },
      { label: "Canal", value: l.channel },
      { label: "Intérêt", value: l.interest },
      { label: "Score IA", value: `${l.score}/100` },
      { label: "Statut", value: l.status },
      { label: "Reçu le", value: l.capturedAt },
    ];
  }
  if (entity === "devis") {
    const q = r as Quote;
    return [
      { label: "Référence", value: q.ref },
      { label: "Client", value: q.client },
      { label: "Montant", value: formatMAD(q.amount) },
      { label: "Statut", value: q.status },
      { label: "Synchronisation", value: q.sync },
      { label: "Date", value: q.date },
      { label: "Lignes", value: String(q.lines.length) },
    ];
  }
  if (entity === "commande") {
    const o = r as Order;
    return [
      { label: "Référence", value: o.ref },
      { label: "Client", value: o.client },
      { label: "Canal", value: o.channel },
      { label: "Montant", value: formatMAD(o.amount) },
      { label: "Statut", value: o.status },
      { label: "Articles", value: o.items },
    ];
  }
  const rl = r as RelanceItem;
  return [
    { label: "Facture", value: rl.ref },
    { label: "Client", value: rl.client },
    { label: "Montant dû", value: formatMAD(rl.amount) },
    { label: "Échéance", value: rl.dueDate },
    { label: "Relances envoyées", value: String(rl.sent) },
    { label: "Réponse client", value: rl.reply },
    { label: "Note", value: rl.note },
  ];
}

function listRows(entity: EntityKind, records: AnyRecord[]) {
  if (entity === "client") {
    return {
      headers: ["Client", "Ville", "Segment", "Encours"],
      data: (records as Client[]).map((c) => [c.name, c.city, c.segment, formatMAD(c.outstanding)]),
    };
  }
  if (entity === "produit") {
    return {
      headers: ["Produit", "Réf.", "Prix", "Stock"],
      data: (records as Product[]).map((p) => [p.name, p.ref, formatMAD(p.price), String(p.stock)]),
    };
  }
  if (entity === "lead") {
    return {
      headers: ["Société", "Canal", "Score", "Statut"],
      data: (records as Lead[]).map((l) => [l.company, l.channel, String(l.score), l.status]),
    };
  }
  if (entity === "devis") {
    return {
      headers: ["Référence", "Client", "Montant", "Statut"],
      data: (records as Quote[]).map((q) => [q.ref, q.client, formatMAD(q.amount), q.status]),
    };
  }
  if (entity === "commande") {
    return {
      headers: ["Référence", "Client", "Montant", "Statut"],
      data: (records as Order[]).map((o) => [o.ref, o.client, formatMAD(o.amount), o.status]),
    };
  }
  return {
    headers: ["Facture", "Client", "Montant", "Réponse"],
    data: (records as RelanceItem[]).map((r) => [r.ref, r.client, formatMAD(r.amount), r.reply]),
  };
}

/* ───────── champs modifiables ───────── */

export const fieldMap: Record<EntityKind, Record<string, string>> = {
  client: {
    email: "email",
    "e-mail": "email",
    mail: "email",
    telephone: "phone",
    tel: "phone",
    phone: "phone",
    adresse: "address",
    ville: "city",
    contact: "contact",
    nom: "name",
    segment: "segment",
    encours: "outstanding",
    paiement: "paymentTerms",
  },
  produit: {
    prix: "price",
    tarif: "price",
    cout: "cost",
    stock: "stock",
    nom: "name",
    categorie: "category",
    description: "description",
  },
  lead: { statut: "status", score: "score", interet: "interest", contact: "contact", canal: "channel" },
  devis: { statut: "status", montant: "amount", client: "client" },
  commande: { statut: "status", montant: "amount", client: "client" },
  relance: { reponse: "reply", note: "note", montant: "amount", relances: "sent" },
};

const numericFields = new Set(["price", "cost", "stock", "amount", "score", "outstanding", "sent", "minStock"]);

function replaceIn<T extends { id: string }>(list: T[], id: string, patch: Partial<T>) {
  return list.map((r) => (r.id === id ? { ...r, ...patch } : r));
}

function writeCollection(s: CopiloteState, entity: EntityKind, list: AnyRecord[]): CopiloteState {
  switch (entity) {
    case "client":
      return { ...s, clients: list as Client[] };
    case "produit":
      return { ...s, products: list as Product[] };
    case "lead":
      return { ...s, leads: list as Lead[] };
    case "devis":
      return { ...s, quotes: list as Quote[] };
    case "commande":
      return { ...s, orders: list as Order[] };
    case "relance":
      return { ...s, relances: list as RelanceItem[] };
  }
}

function blankRecord(entity: EntityKind, args: ToolArgs): AnyRecord {
  const name = args["name"] ?? "Sans nom";
  if (entity === "client") {
    return {
      id: uid("cl"),
      ref: `RP-${Math.floor(10000 + Math.random() * 89999)}`,
      name,
      contact: args["contact"] ?? "—",
      email: args["email"] ?? "—",
      phone: args["phone"] ?? "—",
      city: args["city"] ?? "Casablanca",
      address: args["address"] ?? "—",
      segment: "Santé",
      vat: "—",
      paymentTerms: "30 jours",
      outstanding: 0,
      active: true,
    } satisfies Client;
  }
  if (entity === "produit") {
    return {
      id: uid("pr"),
      ref: `APR-${name.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 899)}`,
      name,
      category: "Désinfection",
      price: Number(args["price"] ?? 0),
      cost: Math.round(Number(args["price"] ?? 0) * 0.6),
      unit: "Unité",
      stock: Number(args["stock"] ?? 0),
      minStock: 10,
      description: args["description"] ?? "Produit créé par le Copilote IA.",
      active: true,
    } satisfies Product;
  }
  if (entity === "lead") {
    return {
      id: `LD-${Math.floor(1000 + Math.random() * 8999)}`,
      company: name,
      contact: args["contact"] ?? "—",
      channel: "WhatsApp",
      interest: args["interest"] ?? "À qualifier",
      capturedAt: today(),
      status: "nouveau",
      score: 50,
      summary: "Lead créé manuellement via le Copilote IA.",
      recommendation: "Qualifier lors du prochain appel.",
      conversation: [],
    } satisfies Lead;
  }
  if (entity === "devis") {
    return {
      id: uid("q"),
      ref: `DEV-2026-${Math.floor(100 + Math.random() * 899)}`,
      client: name,
      amount: Number(args["amount"] ?? 0),
      status: "Brouillon",
      sync: "En attente",
      date: today(),
      relance: false,
      lines: [],
      email: "",
      contact: args["contact"] ?? "—",
      phone: args["phone"] ?? "—",
    } satisfies Quote;
  }
  if (entity === "commande") {
    return {
      id: uid("o"),
      ref: `CMD-2026-${Math.floor(100 + Math.random() * 899)}`,
      client: name,
      channel: "WhatsApp",
      amount: Number(args["amount"] ?? 0),
      date: today(),
      status: "Reçue",
      items: args["items"] ?? "À préciser",
    } satisfies Order;
  }
  return {
    id: uid("rl"),
    client: name,
    ref: `FAC-2026-${Math.floor(100 + Math.random() * 899)}`,
    amount: Number(args["amount"] ?? 0),
    dueDate: today(),
    sent: 0,
    lastSentAt: "—",
    nextAt: "—",
    reply: "aucune",
    channel: "WhatsApp",
    note: "Relance créée par le Copilote IA.",
  } satisfies RelanceItem;
}

/* ───────── WordPress ───────── */

function findPage(pages: WpPage[], q: string) {
  const n = norm(q);
  return pages.find((p) => norm(p.title).includes(n) || norm(p.slug).includes(n)) ?? pages[0];
}

/* ───────── exécution ───────── */

export function runTool(name: ToolName, args: ToolArgs, ctx: ToolCtx): ToolResult {
  const { state, update, role } = ctx;
  const writes: ToolName[] = [
    "create_record",
    "update_record",
    "delete_record",
    "wp_update_text",
    "wp_replace_image",
    "wp_create_page",
    "wp_delete_page",
    "wp_publish",
    "wp_connect",
  ];
  if (writes.includes(name) && role === "Lecteur") {
    return { ok: false, text: "Votre profil est en lecture seule : cette action ne peut pas être exécutée." };
  }

  const entity = (args["entity"] as EntityKind) ?? "client";

  switch (name) {
    case "list_records": {
      let records = collection(state, entity);
      const filter = args["filter"];
      if (filter) {
        const f = norm(filter);
        records = records.filter((r) =>
          norm(Object.values(r as Record<string, unknown>).filter((v) => typeof v === "string" || typeof v === "number").join(" ")).includes(f),
        );
      }
      if (!records.length) return { ok: true, text: `Aucun résultat pour « ${entityLabel[entity]} ».` };
      return {
        ok: true,
        text: `${records.length} ${entityLabel[entity].toLowerCase()}(s) trouvé(s) dans Odoo :`,
        rows: listRows(entity, records.slice(0, 12)),
      };
    }

    case "get_record": {
      const r = findRecord(state, entity, args["query"] ?? "");
      if (!r) return { ok: false, text: `Aucun ${entityLabel[entity].toLowerCase()} ne correspond à « ${args["query"]} ».` };
      return { ok: true, text: `Fiche ${entityLabel[entity].toLowerCase()} — ${recordTitle(entity, r)} :`, table: summarize(entity, r) };
    }

    case "create_record": {
      const created = blankRecord(entity, args);
      update((s) => writeCollection(s, entity, [created, ...collection(s, entity)]));
      return {
        ok: true,
        text: `${entityLabel[entity]} créé dans Odoo : ${recordTitle(entity, created)}.`,
        table: summarize(entity, created),
      };
    }

    case "update_record": {
      const r = findRecord(state, entity, args["query"] ?? "");
      if (!r) return { ok: false, text: `Enregistrement introuvable : « ${args["query"]} ».` };
      const field = args["field"] ?? "";
      if (!field) return { ok: false, text: "Champ à modifier non identifié." };
      const raw = args["value"] ?? "";
      const patch = { [field]: numericFields.has(field) ? Number(raw.replace(/[^\d.]/g, "")) : raw } as Partial<AnyRecord>;
      update((s) => writeCollection(s, entity, replaceIn(collection(s, entity) as { id: string }[], r.id, patch) as AnyRecord[]));
      const after = { ...(r as Record<string, unknown>), ...patch } as AnyRecord;
      return {
        ok: true,
        text: `${entityLabel[entity]} mis à jour : ${recordTitle(entity, r)}.`,
        table: summarize(entity, after),
      };
    }

    case "delete_record": {
      const r = findRecord(state, entity, args["query"] ?? "");
      if (!r) return { ok: false, text: `Enregistrement introuvable : « ${args["query"]} ».` };
      update((s) => writeCollection(s, entity, collection(s, entity).filter((x) => x.id !== r.id)));
      return { ok: true, text: `${entityLabel[entity]} supprimé d'Odoo : ${recordTitle(entity, r)}.` };
    }

    case "get_stats": {
      const ca = state.orders.reduce((t, o) => (o.status === "Annulée" ? t : t + o.amount), 0);
      const impayes = state.relances.reduce((t, r) => t + r.amount, 0);
      return {
        ok: true,
        text: "Synthèse temps réel de l'activité :",
        table: [
          { label: "Clients actifs", value: String(state.clients.filter((c) => c.active).length) },
          { label: "Produits au catalogue", value: String(state.products.length) },
          { label: "Leads en cours", value: String(state.leads.filter((l) => l.status !== "hors-sujet").length) },
          { label: "Devis ouverts", value: String(state.quotes.filter((q) => q.status !== "Refusé").length) },
          { label: "Commandes", value: String(state.orders.length) },
          { label: "Chiffre d'affaires commandes", value: formatMAD(ca) },
          { label: "Encours à relancer", value: formatMAD(impayes) },
        ],
      };
    }

    case "wp_connect": {
      update((s) => ({ ...s, wp: { ...s.wp, connected: true } }));
      return {
        ok: true,
        text: "Site WordPress connecté (simulation).",
        table: [
          { label: "Site", value: state.wp.url },
          { label: "Pages", value: String(state.wp.pages.length) },
          { label: "Articles", value: String(state.wp.posts.length) },
          { label: "Médias", value: String(state.wp.media.length) },
        ],
      };
    }

    case "wp_list": {
      const kind = args["kind"] ?? "pages";
      if (kind === "articles") {
        return {
          ok: true,
          text: "Articles du site apro.ma :",
          rows: { headers: ["Titre", "Statut", "Date"], data: state.wp.posts.map((p) => [p.title, p.status, p.date]) },
        };
      }
      if (kind === "medias") {
        return {
          ok: true,
          text: "Médias du site apro.ma :",
          rows: { headers: ["Fichier", "Titre", "Utilisé sur"], data: state.wp.media.map((m) => [m.file, m.title, m.usedIn]) },
        };
      }
      return {
        ok: true,
        text: "Pages du site apro.ma :",
        rows: {
          headers: ["Page", "Adresse", "Statut", "Mise à jour"],
          data: state.wp.pages.map((p) => [p.title, p.slug, p.status, p.updatedAt]),
        },
      };
    }

    case "wp_update_text": {
      const page = findPage(state.wp.pages, args["page"] ?? "accueil");
      if (!page) return { ok: false, text: "Page introuvable sur le site." };
      const blockQ = norm(args["block"] ?? "titre");
      const block = page.blocks.find((b) => b.type === "texte" && norm(b.label).includes(blockQ)) ?? page.blocks.find((b) => b.type === "texte");
      if (!block) return { ok: false, text: "Aucun bloc de texte modifiable sur cette page." };
      const before = block.value;
      const value = args["value"] ?? "";
      update((s) => ({
        ...s,
        wp: {
          ...s.wp,
          pages: s.wp.pages.map((p) =>
            p.id === page.id
              ? { ...p, updatedAt: today(), blocks: p.blocks.map((b) => (b.id === block.id ? { ...b, value } : b)) }
              : p,
          ),
        },
      }));
      return {
        ok: true,
        text: `Texte mis à jour sur la page « ${page.title} ».`,
        table: [
          { label: "Bloc", value: block.label },
          { label: "Avant", value: before },
          { label: "Après", value: value },
        ],
      };
    }

    case "wp_replace_image": {
      const page = findPage(state.wp.pages, args["page"] ?? "accueil");
      if (!page) return { ok: false, text: "Page introuvable sur le site." };
      const block = page.blocks.find((b) => b.type === "image");
      if (!block) return { ok: false, text: `La page « ${page.title} » ne contient pas d'image remplaçable.` };
      const file = args["file"] ?? "nouvelle-image.jpg";
      const before = block.value;
      update((s) => ({
        ...s,
        wp: {
          ...s.wp,
          media: [{ id: uid("m"), file, title: file, url: `/wp-content/${file}`, usedIn: page.title }, ...s.wp.media],
          pages: s.wp.pages.map((p) =>
            p.id === page.id
              ? { ...p, updatedAt: today(), blocks: p.blocks.map((b) => (b.id === block.id ? { ...b, value: file } : b)) }
              : p,
          ),
        },
      }));
      return {
        ok: true,
        text: `Image remplacée sur la page « ${page.title} ».`,
        table: [
          { label: "Emplacement", value: block.label },
          { label: "Ancienne image", value: before },
          { label: "Nouvelle image", value: file },
        ],
      };
    }

    case "wp_create_page": {
      const title = args["title"] ?? "Nouvelle page";
      const page: WpPage = {
        id: uid("wp"),
        title,
        slug: `/${norm(title).replace(/\s+/g, "-")}`,
        status: "Brouillon",
        updatedAt: today(),
        blocks: [
          { id: uid("b"), label: "Titre principal", type: "texte", value: title },
          { id: uid("b"), label: "Contenu", type: "texte", value: args["content"] ?? "Contenu à compléter." },
        ],
      };
      update((s) => ({ ...s, wp: { ...s.wp, pages: [...s.wp.pages, page] } }));
      return {
        ok: true,
        text: `Page créée en brouillon sur apro.ma : « ${title} ».`,
        table: [
          { label: "Adresse", value: page.slug },
          { label: "Statut", value: page.status },
        ],
      };
    }

    case "wp_delete_page": {
      const page = findPage(state.wp.pages, args["page"] ?? "");
      if (!page) return { ok: false, text: "Page introuvable sur le site." };
      update((s) => ({ ...s, wp: { ...s.wp, pages: s.wp.pages.filter((p) => p.id !== page.id) } }));
      return { ok: true, text: `Page supprimée du site : « ${page.title} ».` };
    }

    case "wp_publish": {
      const page = findPage(state.wp.pages, args["page"] ?? "");
      if (!page) return { ok: false, text: "Page introuvable sur le site." };
      update((s) => ({
        ...s,
        wp: { ...s.wp, pages: s.wp.pages.map((p) => (p.id === page.id ? { ...p, status: "Publiée", updatedAt: today() } : p)) },
      }));
      return { ok: true, text: `Page publiée : « ${page.title} » (${page.slug}).` };
    }
  }
}
