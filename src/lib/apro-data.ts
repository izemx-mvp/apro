// Données de démonstration APRO Hygiène (back-office)

export type LeadStatus = "nouveau" | "qualification" | "qualifie" | "hors-sujet";
export type Channel = "WhatsApp" | "Site Web";

export type Lead = {
  id: string;
  company: string;
  contact: string;
  channel: Channel;
  interest: string;
  capturedAt: string;
  status: LeadStatus;
  score: number;
  summary: string;
  recommendation: string;
  conversation: { from: "client" | "agent"; text: string; at: string }[];
};

export const leadColumns: { id: LeadStatus; label: string }[] = [
  { id: "nouveau", label: "Nouveau" },
  { id: "qualification", label: "En qualification" },
  { id: "qualifie", label: "Qualifié" },
  { id: "hors-sujet", label: "Hors sujet" },
];

export const leads: Lead[] = [
  {
    id: "LD-1042",
    company: "Clinique Al Amal",
    contact: "Dr. Nadia Bennani",
    channel: "WhatsApp",
    interest: "Désinfectant surfaces 5L",
    capturedAt: "2026-08-03",
    status: "nouveau",
    score: 82,
    summary:
      "Établissement de santé cherchant un fournisseur récurrent de désinfectants normés EN 14476 pour 3 sites à Casablanca.",
    recommendation: "Qualifier immédiatement et proposer un devis cadre trimestriel.",
    conversation: [
      { from: "client", text: "Bonjour, vous livrez du désinfectant en bidon 5L ?", at: "09:12" },
      {
        from: "agent",
        text: "Bonjour Docteur, oui — norme EN 14476 disponible en stock.",
        at: "09:13",
      },
      { from: "client", text: "Il me faudrait 40 bidons par mois pour 3 cliniques.", at: "09:20" },
    ],
  },
  {
    id: "LD-1041",
    company: "Hôtel Riad Zitoun",
    contact: "Youssef Alaoui",
    channel: "Site Web",
    interest: "Papier hygiénique + savon mains",
    capturedAt: "2026-08-02",
    status: "nouveau",
    score: 64,
    summary: "Hôtel 4* à Marrakech, besoin de consommables sanitaires pour 78 chambres.",
    recommendation: "Demander le volume mensuel avant chiffrage.",
    conversation: [
      {
        from: "client",
        text: "Quels sont vos tarifs pour le papier hygiénique en gros ?",
        at: "14:05",
      },
      { from: "agent", text: "Cela dépend du volume mensuel. Combien de chambres ?", at: "14:06" },
    ],
  },
  {
    id: "LD-1038",
    company: "Groupe Scolaire Ibn Sina",
    contact: "Salma Cherkaoui",
    channel: "WhatsApp",
    interest: "Nettoyant sol industriel",
    capturedAt: "2026-08-01",
    status: "qualification",
    score: 71,
    summary: "Établissement scolaire, appel d'offres rentrée septembre, budget estimé 60 000 MAD.",
    recommendation: "Envoyer le catalogue sols + fiche technique avant vendredi.",
    conversation: [
      { from: "client", text: "Nous préparons la rentrée, avez-vous un catalogue ?", at: "11:41" },
      { from: "agent", text: "Oui, je vous l'envoie avec nos tarifs collectivités.", at: "11:43" },
    ],
  },
  {
    id: "LD-1035",
    company: "Restaurant La Sqala",
    contact: "Karim Idrissi",
    channel: "Site Web",
    interest: "Dégraissant cuisine pro",
    capturedAt: "2026-07-30",
    status: "qualification",
    score: 58,
    summary: "Restaurant indépendant, commande ponctuelle, sensible au prix.",
    recommendation: "Proposer le format 2L en offre découverte.",
    conversation: [{ from: "client", text: "Prix du dégraissant 2L ?", at: "18:22" }],
  },
  {
    id: "LD-1030",
    company: "Marjane Holding",
    contact: "Imane Tazi",
    channel: "WhatsApp",
    interest: "Contrat annuel consommables",
    capturedAt: "2026-07-28",
    status: "qualifie",
    score: 94,
    summary: "Grand compte retail, contrat cadre annuel multi-sites, décisionnaire identifié.",
    recommendation: "Compte Odoo créé — planifier rendez-vous commercial.",
    conversation: [
      {
        from: "client",
        text: "Nous voulons référencer un fournisseur hygiène pour 2026.",
        at: "10:02",
      },
      { from: "agent", text: "Parfait, je transfère à notre équipe grands comptes.", at: "10:05" },
    ],
  },
  {
    id: "LD-1029",
    company: "Particulier — A. Rami",
    contact: "Ahmed Rami",
    channel: "Site Web",
    interest: "Achat unitaire éponge",
    capturedAt: "2026-07-27",
    status: "hors-sujet",
    score: 12,
    summary: "Demande particulier hors cible B2B, volume non pertinent.",
    recommendation: "Archivé — orienter vers revendeur local.",
    conversation: [{ from: "client", text: "Je veux acheter 2 éponges", at: "20:14" }],
  },
];

export type QuoteStatus = "Brouillon" | "Envoyé" | "En attente" | "Accepté" | "Refusé" | "Expiré";
export type SyncStatus = "Synchronisé" | "En attente" | "Erreur";

export type Quote = {
  id: string;
  ref: string;
  client: string;
  amount: number;
  status: QuoteStatus;
  sync: SyncStatus;
  date: string;
  relance: boolean;
  lines: { product: string; qty: number; unit: number }[];
  email: string;
  contact: string;
  phone: string;
};

export const quotes: Quote[] = [
  {
    id: "q1",
    ref: "DEV-2026-0184",
    client: "Marjane Holding",
    amount: 184500,
    status: "Envoyé",
    sync: "Synchronisé",
    date: "2026-08-01",
    relance: true,
    contact: "Imane Tazi",
    phone: "+212 661 22 44 88",
    lines: [
      { product: "Désinfectant surfaces 5L", qty: 120, unit: 285 },
      { product: "Papier hygiénique pro (colis 36)", qty: 200, unit: 420 },
      { product: "Savon mains moussant 1L", qty: 150, unit: 435 },
    ],
    email:
      "Bonjour Madame Tazi,\n\nJe me permets de revenir vers vous concernant notre devis DEV-2026-0184 transmis le 1er août.\nRestant à votre disposition pour ajuster les volumes ou le calendrier de livraison.\n\nBien cordialement,\nService commercial APRO Hygiène",
  },
  {
    id: "q2",
    ref: "DEV-2026-0183",
    client: "Clinique Al Amal",
    amount: 42300,
    status: "En attente",
    sync: "En attente",
    date: "2026-07-30",
    relance: true,
    contact: "Dr. Nadia Bennani",
    phone: "+212 522 45 78 12",
    lines: [
      { product: "Désinfectant EN 14476 5L", qty: 40, unit: 690 },
      { product: "Gel hydroalcoolique 500ml", qty: 90, unit: 165 },
    ],
    email:
      "Bonjour Docteur Bennani,\n\nAvez-vous pu examiner notre proposition DEV-2026-0183 ?\nNous pouvons démarrer les livraisons dès la semaine prochaine.\n\nBien cordialement,\nAPRO Hygiène",
  },
  {
    id: "q3",
    ref: "DEV-2026-0181",
    client: "Hôtel Riad Zitoun",
    amount: 28750,
    status: "Accepté",
    sync: "Synchronisé",
    date: "2026-07-27",
    relance: false,
    contact: "Youssef Alaoui",
    phone: "+212 664 90 11 03",
    lines: [
      { product: "Papier hygiénique pro (colis 36)", qty: 50, unit: 420 },
      { product: "Savon mains moussant 1L", qty: 18, unit: 430 },
    ],
    email:
      "Bonjour M. Alaoui,\n\nMerci pour votre confiance. La commande est en préparation.\n\nAPRO Hygiène",
  },
  {
    id: "q4",
    ref: "DEV-2026-0179",
    client: "Groupe Scolaire Ibn Sina",
    amount: 61200,
    status: "Brouillon",
    sync: "En attente",
    date: "2026-07-25",
    relance: false,
    contact: "Salma Cherkaoui",
    phone: "+212 537 22 09 55",
    lines: [{ product: "Nettoyant sol industriel 20L", qty: 60, unit: 1020 }],
    email:
      "Bonjour Madame Cherkaoui,\n\nVoici notre proposition pour la rentrée scolaire.\n\nAPRO Hygiène",
  },
  {
    id: "q5",
    ref: "DEV-2026-0175",
    client: "Restaurant La Sqala",
    amount: 4860,
    status: "Expiré",
    sync: "Erreur",
    date: "2026-07-12",
    relance: false,
    contact: "Karim Idrissi",
    phone: "+212 660 78 34 21",
    lines: [{ product: "Dégraissant cuisine 2L", qty: 24, unit: 202.5 }],
    email:
      "Bonjour M. Idrissi,\n\nVotre devis a expiré, souhaitez-vous que nous le réactivions ?\n\nAPRO Hygiène",
  },
  {
    id: "q6",
    ref: "DEV-2026-0170",
    client: "Résidence Anfa Place",
    amount: 15900,
    status: "Refusé",
    sync: "Synchronisé",
    date: "2026-07-08",
    relance: false,
    contact: "Hicham Berrada",
    phone: "+212 522 98 74 10",
    lines: [{ product: "Kit entretien commun 10L", qty: 15, unit: 1060 }],
    email:
      "Bonjour M. Berrada,\n\nMerci de votre retour, nous restons disponibles.\n\nAPRO Hygiène",
  },
];

export const activity30d = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(2026, 6, 5 + i);
  const base = Math.sin(i / 3) * 4;
  return {
    date: d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
    leads: Math.max(2, Math.round(12 + base + (i % 5))),
    devis: Math.max(1, Math.round(8 + base / 2 + (i % 4))),
    commandes: Math.max(0, Math.round(4 + base / 3 + (i % 3))),
  };
});

export const priorityActions = [
  {
    type: "devis" as const,
    title: "Devis DEV-2026-0184 expire dans 18h",
    detail: "Marjane Holding · 184 500 MAD",
    severity: "warning" as const,
  },
  {
    type: "lead" as const,
    title: "3 leads non qualifiés en attente",
    detail: "Capturés il y a plus de 24h via WhatsApp",
    severity: "info" as const,
  },
  {
    type: "sync" as const,
    title: "Erreur de synchronisation Odoo",
    detail: "DEV-2026-0175 · code 409 conflit client",
    severity: "error" as const,
  },
  {
    type: "devis" as const,
    title: "Devis DEV-2026-0183 sans réponse (J+4)",
    detail: "Clinique Al Amal · relance auto programmée",
    severity: "warning" as const,
  },
];

export const automations = [
  {
    id: "a1",
    type: "Vérification stock",
    trigger: "Chaque jour à 07:00",
    status: "ok" as const,
    at: "03/08/2026 07:00",
    log: "142 références contrôlées · 6 sous le seuil minimum · alerte envoyée au responsable achats.",
  },
  {
    id: "a2",
    type: "Validation commande",
    trigger: "Devis accepté dans Odoo",
    status: "ok" as const,
    at: "02/08/2026 16:41",
    log: "Commande SO-3391 créée depuis DEV-2026-0181 · client Hôtel Riad Zitoun · 28 750 MAD.",
  },
  {
    id: "a3",
    type: "Relance devis",
    trigger: "J+3 sans réponse client",
    status: "error" as const,
    at: "02/08/2026 09:15",
    log: "Échec API Odoo : 409 conflit sur le partenaire « Restaurant La Sqala » (doublon détecté).",
  },
  {
    id: "a4",
    type: "Vérification stock",
    trigger: "Chaque jour à 07:00",
    status: "ok" as const,
    at: "01/08/2026 07:00",
    log: "138 références contrôlées · aucun incident.",
  },
];

export const automationRules = [
  {
    id: "r1",
    name: "Relance devis J+3",
    trigger: "Devis envoyé sans réponse 3 jours",
    action: "Envoyer email de relance",
    active: true,
  },
  {
    id: "r2",
    name: "Alerte stock bas",
    trigger: "Quantité < seuil minimum",
    action: "Notifier achats + créer brouillon PO",
    active: true,
  },
  {
    id: "r3",
    name: "Création compte client",
    trigger: "Lead marqué qualifié",
    action: "Créer partenaire Odoo",
    active: true,
  },
  {
    id: "r4",
    name: "Rapport hebdo ventes",
    trigger: "Lundi 08:00",
    action: "Générer et envoyer le bilan",
    active: false,
  },
];

export type Conversation = {
  id: string;
  name: string;
  channel: Channel;
  preview: string;
  status: "En cours IA" | "Transféré humain" | "Résolu";
  unread: number;
  messages: { from: "client" | "ia" | "humain"; text: string; at: string }[];
};

export const conversations: Conversation[] = [
  {
    id: "c1",
    name: "Clinique Al Amal",
    channel: "WhatsApp",
    preview: "Il me faudrait 40 bidons par mois…",
    status: "En cours IA",
    unread: 2,
    messages: [
      { from: "client", text: "Bonjour, vous livrez du désinfectant en bidon 5L ?", at: "09:12" },
      {
        from: "ia",
        text: "Bonjour ! Oui, nos bidons 5L norme EN 14476 sont en stock.",
        at: "09:13",
      },
      { from: "client", text: "Il me faudrait 40 bidons par mois pour 3 cliniques.", at: "09:20" },
    ],
  },
  {
    id: "c2",
    name: "Hôtel Riad Zitoun",
    channel: "Site Web",
    preview: "Quels sont vos tarifs en gros ?",
    status: "Transféré humain",
    unread: 0,
    messages: [
      {
        from: "client",
        text: "Quels sont vos tarifs pour le papier hygiénique en gros ?",
        at: "14:05",
      },
      { from: "ia", text: "Je transfère votre demande à un commercial.", at: "14:06" },
      {
        from: "humain",
        text: "Bonjour, Youssef Alaoui ? Je vous envoie une grille tarifaire.",
        at: "14:22",
      },
    ],
  },
  {
    id: "c3",
    name: "Groupe Scolaire Ibn Sina",
    channel: "WhatsApp",
    preview: "Merci pour le catalogue !",
    status: "Résolu",
    unread: 0,
    messages: [
      { from: "client", text: "Nous préparons la rentrée, avez-vous un catalogue ?", at: "11:41" },
      { from: "ia", text: "Le voici avec nos tarifs collectivités.", at: "11:43" },
      { from: "client", text: "Merci pour le catalogue !", at: "11:52" },
    ],
  },
  {
    id: "c4",
    name: "Restaurant La Sqala",
    channel: "Site Web",
    preview: "Prix du dégraissant 2L ?",
    status: "En cours IA",
    unread: 1,
    messages: [{ from: "client", text: "Prix du dégraissant 2L ?", at: "18:22" }],
  },
];

export type KbEntry = { id: string; title: string; detail: string; active: boolean };

export const knowledgeBase: { section: string; entries: KbEntry[] }[] = [
  {
    section: "Catalogue produits",
    entries: [
      {
        id: "k1",
        title: "Désinfectant surfaces 5L",
        detail: "Norme EN 14476 · colis de 4 · réf. DES-5000",
        active: true,
      },
      {
        id: "k2",
        title: "Nettoyant sol industriel 20L",
        detail: "pH neutre · réf. SOL-2000",
        active: true,
      },
      {
        id: "k3",
        title: "Dégraissant cuisine 2L",
        detail: "Contact alimentaire · réf. DEG-200",
        active: false,
      },
    ],
  },
  {
    section: "Tarifs",
    entries: [
      {
        id: "k4",
        title: "Grille B2B 2026",
        detail: "Remise volume : -8% dès 50 unités, -15% dès 200",
        active: true,
      },
      {
        id: "k5",
        title: "Tarifs collectivités",
        detail: "Marchés publics et établissements scolaires",
        active: true,
      },
    ],
  },
  {
    section: "Procédures APRO",
    entries: [
      {
        id: "k6",
        title: "Délais de livraison",
        detail: "Casablanca 24h · reste du Maroc 48–72h",
        active: true,
      },
      {
        id: "k7",
        title: "Conditions de paiement",
        detail: "30 jours fin de mois pour les comptes validés",
        active: true,
      },
    ],
  },
  {
    section: "FAQ",
    entries: [
      {
        id: "k8",
        title: "Livrez-vous hors Maroc ?",
        detail: "Non, livraison sur le territoire marocain uniquement",
        active: true,
      },
      {
        id: "k9",
        title: "Vendez-vous aux particuliers ?",
        detail: "Non, activité exclusivement B2B",
        active: true,
      },
    ],
  },
];

export const users = [
  { id: "u1", name: "Yassine El Fassi", email: "y.elfassi@aprohygiene.ma", role: "Admin" as const },
  { id: "u2", name: "Sofia Bennis", email: "s.bennis@aprohygiene.ma", role: "Commercial" as const },
  { id: "u3", name: "Omar Naciri", email: "o.naciri@aprohygiene.ma", role: "Commercial" as const },
  { id: "u4", name: "Leila Haddad", email: "l.haddad@aprohygiene.ma", role: "Lecteur" as const },
];

export const modulesList = [
  "Dashboard",
  "Leads",
  "Devis & Commandes",
  "Copilote Odoo",
  "Service Client",
  "Paramètres",
];

export const formatMAD = (n: number) =>
  new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 0,
  }).format(n);

/* ───────────────── Service Client IA ───────────────── */

export type SocialLink = {
  id: string;
  network: string;
  handle: string;
  url: string;
  active: boolean;
};

export const socialLinks: SocialLink[] = [
  {
    id: "s1",
    network: "WhatsApp Business",
    handle: "+212 522 00 11 22",
    url: "https://wa.me/212522001122",
    active: true,
  },
  {
    id: "s2",
    network: "Facebook",
    handle: "@aprohygiene",
    url: "https://facebook.com/aprohygiene",
    active: true,
  },
  {
    id: "s3",
    network: "Instagram",
    handle: "@apro.hygiene",
    url: "https://instagram.com/apro.hygiene",
    active: true,
  },
  {
    id: "s4",
    network: "LinkedIn",
    handle: "APRO Hygiène",
    url: "https://linkedin.com/company/apro-hygiene",
    active: true,
  },
  { id: "s5", network: "Site web", handle: "apro.ma", url: "https://apro.ma", active: true },
];

export type FaqItem = { id: string; question: string; answer: string; active: boolean };

export const faqItems: FaqItem[] = [
  {
    id: "f1",
    question: "Livrez-vous partout au Maroc ?",
    answer: "Oui : Casablanca sous 24h, reste du Maroc sous 48 à 72h.",
    active: true,
  },
  {
    id: "f2",
    question: "Vendez-vous aux particuliers ?",
    answer: "Non, APRO Hygiène est un fournisseur exclusivement B2B.",
    active: true,
  },
  {
    id: "f3",
    question: "Quelles sont vos conditions de paiement ?",
    answer: "30 jours fin de mois pour les comptes validés, sinon paiement à la commande.",
    active: true,
  },
  {
    id: "f4",
    question: "Proposez-vous des remises volume ?",
    answer: "-8% dès 50 unités et -15% dès 200 unités sur la grille B2B 2026.",
    active: true,
  },
  {
    id: "f5",
    question: "Vos désinfectants sont-ils normés ?",
    answer: "Oui, gamme certifiée EN 14476 et EN 1276.",
    active: false,
  },
];

export type DocItem = {
  id: string;
  name: string;
  type: "PDF" | "XLSX" | "DOCX";
  size: string;
  updatedAt: string;
  url: string;
  active: boolean;
};

export const documents: DocItem[] = [
  {
    id: "d1",
    name: "Catalogue produits 2026",
    type: "PDF",
    size: "4,2 Mo",
    updatedAt: "2026-07-20",
    url: "#",
    active: true,
  },
  {
    id: "d2",
    name: "Grille tarifaire B2B",
    type: "XLSX",
    size: "180 Ko",
    updatedAt: "2026-07-28",
    url: "#",
    active: true,
  },
  {
    id: "d3",
    name: "Fiches techniques désinfectants",
    type: "PDF",
    size: "1,8 Mo",
    updatedAt: "2026-06-11",
    url: "#",
    active: true,
  },
  {
    id: "d4",
    name: "Conditions générales de vente",
    type: "PDF",
    size: "320 Ko",
    updatedAt: "2026-01-05",
    url: "#",
    active: false,
  },
];

export type DayHours = { day: string; open: string; close: string; closed: boolean };

export const openingHours: DayHours[] = [
  { day: "Lundi", open: "08:30", close: "18:00", closed: false },
  { day: "Mardi", open: "08:30", close: "18:00", closed: false },
  { day: "Mercredi", open: "08:30", close: "18:00", closed: false },
  { day: "Jeudi", open: "08:30", close: "18:00", closed: false },
  { day: "Vendredi", open: "08:30", close: "17:30", closed: false },
  { day: "Samedi", open: "09:00", close: "13:00", closed: false },
  { day: "Dimanche", open: "00:00", close: "00:00", closed: true },
];

/* ───────────────── Relance IA ───────────────── */

export type RelanceDay = { day: string; enabled: boolean; from: string; to: string };

export const relanceDays: RelanceDay[] = [
  { day: "Lundi", enabled: true, from: "09:00", to: "17:00" },
  { day: "Mardi", enabled: true, from: "09:00", to: "17:00" },
  { day: "Mercredi", enabled: true, from: "09:00", to: "17:00" },
  { day: "Jeudi", enabled: true, from: "09:00", to: "17:00" },
  { day: "Vendredi", enabled: true, from: "09:00", to: "16:00" },
  { day: "Samedi", enabled: false, from: "10:00", to: "12:00" },
  { day: "Dimanche", enabled: false, from: "10:00", to: "12:00" },
];

export const relanceDefaults = {
  maxRelances: 3,
  waitBeforeFirst: 3,
  daysBetween: 4,
};

export type RelanceReply = "oui" | "non" | "aucune";

export type RelanceItem = {
  id: string;
  client: string;
  ref: string;
  amount: number;
  dueDate: string;
  sent: number;
  lastSentAt: string;
  nextAt: string;
  reply: RelanceReply;
  channel: Channel;
  note: string;
};

export const relanceItems: RelanceItem[] = [
  {
    id: "rl1",
    client: "Marjane Holding",
    ref: "FAC-2026-0091",
    amount: 184500,
    dueDate: "2026-07-20",
    sent: 2,
    lastSentAt: "2026-08-02",
    nextAt: "2026-08-06",
    reply: "oui",
    channel: "WhatsApp",
    note: "Virement annoncé pour le 07/08.",
  },
  {
    id: "rl2",
    client: "Clinique Al Amal",
    ref: "FAC-2026-0088",
    amount: 42300,
    dueDate: "2026-07-15",
    sent: 3,
    lastSentAt: "2026-08-03",
    nextAt: "—",
    reply: "aucune",
    channel: "WhatsApp",
    note: "Aucune réponse après 3 relances.",
  },
  {
    id: "rl3",
    client: "Restaurant La Sqala",
    ref: "FAC-2026-0080",
    amount: 4860,
    dueDate: "2026-07-02",
    sent: 3,
    lastSentAt: "2026-07-30",
    reply: "non",
    nextAt: "—",
    channel: "Site Web",
    note: "Conteste le montant livré.",
  },
  {
    id: "rl4",
    client: "Hôtel Riad Zitoun",
    ref: "FAC-2026-0094",
    amount: 28750,
    dueDate: "2026-08-01",
    sent: 1,
    lastSentAt: "2026-08-04",
    nextAt: "2026-08-08",
    reply: "aucune",
    channel: "Site Web",
    note: "Première relance envoyée.",
  },
  {
    id: "rl5",
    client: "Groupe Scolaire Ibn Sina",
    ref: "FAC-2026-0079",
    amount: 61200,
    dueDate: "2026-06-28",
    sent: 2,
    lastSentAt: "2026-07-29",
    nextAt: "2026-08-05",
    reply: "oui",
    channel: "WhatsApp",
    note: "Paiement partiel reçu (30 000 MAD).",
  },
  {
    id: "rl6",
    client: "Résidence Anfa Place",
    ref: "FAC-2026-0075",
    amount: 15900,
    dueDate: "2026-06-15",
    sent: 3,
    lastSentAt: "2026-07-18",
    nextAt: "—",
    reply: "non",
    channel: "Site Web",
    note: "Refuse de payer — litige ouvert.",
  },
];

/* ───────────────── Commandes (WhatsApp / Site web) ───────────────── */

export type Order = {
  id: string;
  ref: string;
  client: string;
  channel: Channel;
  amount: number;
  date: string;
  status: "Reçue" | "En préparation" | "Livrée" | "Annulée";
  items: string;
};

export const orders: Order[] = [
  {
    id: "o1",
    ref: "CMD-2026-0312",
    client: "Hôtel Riad Zitoun",
    channel: "WhatsApp",
    amount: 28750,
    date: "2026-08-03",
    status: "En préparation",
    items: "Papier hygiénique pro ×50 · Savon mains ×18",
  },
  {
    id: "o2",
    ref: "CMD-2026-0311",
    client: "Marjane Holding",
    channel: "Site Web",
    amount: 96400,
    date: "2026-08-02",
    status: "Reçue",
    items: "Désinfectant 5L ×120",
  },
  {
    id: "o3",
    ref: "CMD-2026-0308",
    client: "Clinique Al Amal",
    channel: "WhatsApp",
    amount: 42300,
    date: "2026-07-31",
    status: "Livrée",
    items: "Désinfectant EN 14476 ×40 · Gel hydro ×90",
  },
  {
    id: "o4",
    ref: "CMD-2026-0305",
    client: "Restaurant La Sqala",
    channel: "WhatsApp",
    amount: 4860,
    date: "2026-07-28",
    status: "Annulée",
    items: "Dégraissant 2L ×24",
  },
  {
    id: "o5",
    ref: "CMD-2026-0301",
    client: "Groupe Scolaire Ibn Sina",
    channel: "Site Web",
    amount: 61200,
    date: "2026-07-26",
    status: "Livrée",
    items: "Nettoyant sol 20L ×60",
  },
];
