// Données fictives réalistes inspirées de la structure Odoo (res.partner, product.template)
// et d'un site WordPress connecté. Aucune base de données : simulation intégrale.

export type Client = {
  id: string;
  ref: string; // référence Odoo
  name: string;
  contact: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  segment: "Santé" | "Hôtellerie" | "Restauration" | "Grande distribution" | "Éducation" | "Syndic";
  vat: string;
  paymentTerms: string;
  outstanding: number;
  active: boolean;
};

export const clientsSeed: Client[] = [
  {
    id: "cl1",
    ref: "RP-00142",
    name: "Marjane Holding",
    contact: "Imane Tazi",
    email: "i.tazi@marjane.ma",
    phone: "+212 661 22 44 88",
    city: "Casablanca",
    address: "Zone industrielle Ain Sebaa, Casablanca",
    segment: "Grande distribution",
    vat: "MA-1102934",
    paymentTerms: "30 jours fin de mois",
    outstanding: 184500,
    active: true,
  },
  {
    id: "cl2",
    ref: "RP-00138",
    name: "Clinique Al Amal",
    contact: "Dr. Nadia Bennani",
    email: "n.bennani@alamal.ma",
    phone: "+212 522 47 19 03",
    city: "Casablanca",
    address: "12 rue Ibn Batouta, Maârif, Casablanca",
    segment: "Santé",
    vat: "MA-9938271",
    paymentTerms: "45 jours",
    outstanding: 42300,
    active: true,
  },
  {
    id: "cl3",
    ref: "RP-00127",
    name: "Hôtel Riad Zitoun",
    contact: "Youssef Alaoui",
    email: "y.alaoui@riadzitoun.ma",
    phone: "+212 524 38 77 12",
    city: "Marrakech",
    address: "Derb Zitoun, Médina, Marrakech",
    segment: "Hôtellerie",
    vat: "MA-4471209",
    paymentTerms: "30 jours",
    outstanding: 28750,
    active: true,
  },
  {
    id: "cl4",
    ref: "RP-00119",
    name: "Restaurant La Sqala",
    contact: "Karim Idrissi",
    email: "contact@lasqala.ma",
    phone: "+212 661 90 33 21",
    city: "Casablanca",
    address: "Boulevard des Almohades, Casablanca",
    segment: "Restauration",
    vat: "MA-2287410",
    paymentTerms: "Comptant",
    outstanding: 4860,
    active: true,
  },
  {
    id: "cl5",
    ref: "RP-00104",
    name: "Groupe Scolaire Ibn Sina",
    contact: "Fatima Zahra Rami",
    email: "direction@ibnsina.ma",
    phone: "+212 537 66 12 45",
    city: "Rabat",
    address: "Avenue Al Massira, Hay Riad, Rabat",
    segment: "Éducation",
    vat: "MA-7719002",
    paymentTerms: "60 jours",
    outstanding: 61200,
    active: true,
  },
  {
    id: "cl6",
    ref: "RP-00098",
    name: "Résidence Anfa Place",
    contact: "Mehdi Chraibi",
    email: "syndic@anfaplace.ma",
    phone: "+212 522 95 40 10",
    city: "Casablanca",
    address: "Boulevard de la Corniche, Anfa, Casablanca",
    segment: "Syndic",
    vat: "MA-6650338",
    paymentTerms: "30 jours",
    outstanding: 15900,
    active: false,
  },
];

export type Product = {
  id: string;
  ref: string; // référence interne Odoo
  name: string;
  category: "Désinfection" | "Papier & essuyage" | "Hygiène des mains" | "Sols & surfaces" | "Matériel";
  price: number;
  cost: number;
  unit: string;
  stock: number;
  minStock: number;
  description: string;
  active: boolean;
};

export const productsSeed: Product[] = [
  {
    id: "pr1",
    ref: "APR-DES-5L",
    name: "Désinfectant surfaces 5L",
    category: "Désinfection",
    price: 285,
    cost: 172,
    unit: "Bidon",
    stock: 340,
    minStock: 120,
    description: "Désinfectant virucide norme EN 14476, prêt à l'emploi, bidon 5 litres.",
    active: true,
  },
  {
    id: "pr2",
    ref: "APR-PAP-36",
    name: "Papier hygiénique pro (colis 36)",
    category: "Papier & essuyage",
    price: 420,
    cost: 268,
    unit: "Colis",
    stock: 210,
    minStock: 80,
    description: "Papier hygiénique double épaisseur, colis de 36 rouleaux, usage professionnel.",
    active: true,
  },
  {
    id: "pr3",
    ref: "APR-SAV-1L",
    name: "Savon mains moussant 1L",
    category: "Hygiène des mains",
    price: 435,
    cost: 254,
    unit: "Carton de 6",
    stock: 96,
    minStock: 100,
    description: "Savon moussant dermo-protecteur pour distributeurs professionnels.",
    active: true,
  },
  {
    id: "pr4",
    ref: "APR-SOL-20L",
    name: "Nettoyant sol 20L",
    category: "Sols & surfaces",
    price: 690,
    cost: 415,
    unit: "Bidon",
    stock: 148,
    minStock: 60,
    description: "Nettoyant sol concentré multi-surfaces, dilution 1 %, bidon 20 litres.",
    active: true,
  },
  {
    id: "pr5",
    ref: "APR-GEL-500",
    name: "Gel hydroalcoolique 500 ml",
    category: "Hygiène des mains",
    price: 78,
    cost: 41,
    unit: "Flacon",
    stock: 620,
    minStock: 200,
    description: "Gel hydroalcoolique 70 % avec pompe doseuse, conforme EN 1500.",
    active: true,
  },
  {
    id: "pr6",
    ref: "APR-MAT-CHR",
    name: "Chariot de ménage 2 seaux",
    category: "Matériel",
    price: 2450,
    cost: 1680,
    unit: "Unité",
    stock: 18,
    minStock: 10,
    description: "Chariot de nettoyage professionnel avec presse et deux seaux 25 L.",
    active: true,
  },
];

/* ───────────────── Site WordPress connecté (simulation) ───────────────── */

export type WpMedia = { id: string; file: string; title: string; url: string; usedIn: string };

export type WpBlock = { id: string; label: string; type: "texte" | "image"; value: string };

export type WpPage = {
  id: string;
  title: string;
  slug: string;
  status: "Publiée" | "Brouillon";
  updatedAt: string;
  blocks: WpBlock[];
};

export type WpPost = {
  id: string;
  title: string;
  slug: string;
  status: "Publié" | "Brouillon";
  date: string;
  excerpt: string;
};

export type WpSite = {
  url: string;
  connected: boolean;
  pages: WpPage[];
  posts: WpPost[];
  media: WpMedia[];
};

export const wpSeed: WpSite = {
  url: "https://apro.ma",
  connected: false,
  pages: [
    {
      id: "wp1",
      title: "Accueil",
      slug: "/",
      status: "Publiée",
      updatedAt: "2026-08-01",
      blocks: [
        { id: "b1", label: "Titre principal", type: "texte", value: "L'hygiène professionnelle au service du Maroc" },
        {
          id: "b2",
          label: "Sous-titre",
          type: "texte",
          value: "Produits et solutions d'hygiène pour la santé, l'hôtellerie et l'industrie.",
        },
        { id: "b3", label: "Image bannière", type: "image", value: "hero-accueil.jpg" },
        { id: "b4", label: "Téléphone affiché", type: "texte", value: "+212 522 00 00 00" },
      ],
    },
    {
      id: "wp2",
      title: "À propos",
      slug: "/a-propos",
      status: "Publiée",
      updatedAt: "2026-07-18",
      blocks: [
        {
          id: "b5",
          label: "Texte À propos",
          type: "texte",
          value:
            "APRO Hygiène accompagne depuis 15 ans les professionnels marocains dans la fourniture de produits d'hygiène certifiés.",
        },
        { id: "b6", label: "Image équipe", type: "image", value: "equipe-apro.jpg" },
      ],
    },
    {
      id: "wp3",
      title: "Contact",
      slug: "/contact",
      status: "Publiée",
      updatedAt: "2026-06-30",
      blocks: [
        { id: "b7", label: "Téléphone", type: "texte", value: "+212 522 00 00 00" },
        { id: "b8", label: "Adresse", type: "texte", value: "Zone industrielle, Casablanca, Maroc" },
      ],
    },
  ],
  posts: [
    {
      id: "po1",
      title: "Bien choisir son désinfectant de surfaces",
      slug: "/blog/choisir-desinfectant",
      status: "Publié",
      date: "2026-07-22",
      excerpt: "Normes EN, dilution et fréquence : le guide pratique pour les établissements de santé.",
    },
    {
      id: "po2",
      title: "Hygiène en restauration : les 5 réflexes",
      slug: "/blog/hygiene-restauration",
      status: "Publié",
      date: "2026-06-14",
      excerpt: "Les gestes essentiels pour rester conforme aux contrôles sanitaires.",
    },
    {
      id: "po3",
      title: "Nouveautés catalogue 2026",
      slug: "/blog/catalogue-2026",
      status: "Brouillon",
      date: "2026-08-02",
      excerpt: "Aperçu des nouvelles gammes disponibles à la rentrée.",
    },
  ],
  media: [
    { id: "m1", file: "hero-accueil.jpg", title: "Bannière accueil", url: "/wp-content/hero-accueil.jpg", usedIn: "Accueil" },
    { id: "m2", file: "equipe-apro.jpg", title: "Équipe APRO", url: "/wp-content/equipe-apro.jpg", usedIn: "À propos" },
    { id: "m3", file: "catalogue-2026.pdf", title: "Catalogue 2026", url: "/wp-content/catalogue-2026.pdf", usedIn: "Ressources" },
  ],
};
