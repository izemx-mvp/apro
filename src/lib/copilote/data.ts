// Données fictives réalistes inspirées de la structure Odoo (res.partner, product.template)
// et d'un site WordPress connecté. Aucune base de données : simulation intégrale.

import heroAccueil from "@/assets/wp/hero-accueil.jpg";
import equipeApro from "@/assets/wp/equipe-apro.jpg";
import catalogueProduits from "@/assets/wp/catalogue-produits.jpg";
import secteurSante from "@/assets/wp/secteur-sante.jpg";
import secteurRestauration from "@/assets/wp/secteur-restauration.jpg";
import secteurHotellerie from "@/assets/wp/secteur-hotellerie.jpg";

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
  {
    id: "cl7",
    ref: "RP-00151",
    name: "CHU Ibn Rochd",
    contact: "Pr. Hicham Berrada",
    email: "achats@chu-ibnrochd.ma",
    phone: "+212 522 48 20 20",
    city: "Casablanca",
    address: "1 rue des Hôpitaux, Casablanca",
    segment: "Santé",
    vat: "MA-3390118",
    paymentTerms: "90 jours (marché public)",
    outstanding: 236400,
    active: true,
  },
  {
    id: "cl8",
    ref: "RP-00147",
    name: "Sofitel Tour Blanche",
    contact: "Sanaa El Fassi",
    email: "s.elfassi@sofitel-casa.ma",
    phone: "+212 522 45 96 00",
    city: "Casablanca",
    address: "Rue Sidi Belyout, Casablanca",
    segment: "Hôtellerie",
    vat: "MA-5581047",
    paymentTerms: "45 jours",
    outstanding: 73900,
    active: true,
  },
  {
    id: "cl9",
    ref: "RP-00133",
    name: "Carrefour Market Agadir",
    contact: "Rachid Oubella",
    email: "r.oubella@carrefour.ma",
    phone: "+212 528 82 14 76",
    city: "Agadir",
    address: "Avenue Hassan II, Talborjt, Agadir",
    segment: "Grande distribution",
    vat: "MA-8812440",
    paymentTerms: "30 jours",
    outstanding: 51200,
    active: true,
  },
  {
    id: "cl10",
    ref: "RP-00160",
    name: "Université Al Akhawayn",
    contact: "Latifa Semlali",
    email: "purchasing@aui.ma",
    phone: "+212 535 86 20 00",
    city: "Ifrane",
    address: "Avenue Hassan II, Ifrane",
    segment: "Éducation",
    vat: "MA-1204773",
    paymentTerms: "60 jours",
    outstanding: 34800,
    active: true,
  },
  {
    id: "cl11",
    ref: "RP-00166",
    name: "Groupe Ryad Mogador",
    contact: "Omar Bekkali",
    email: "o.bekkali@ryadmogador.com",
    phone: "+212 524 33 44 55",
    city: "Essaouira",
    address: "Boulevard Mohammed V, Essaouira",
    segment: "Hôtellerie",
    vat: "MA-9017265",
    paymentTerms: "30 jours",
    outstanding: 19400,
    active: true,
  },
  {
    id: "cl12",
    ref: "RP-00171",
    name: "Clinique Atlas Fès",
    contact: "Dr. Salma Kettani",
    email: "s.kettani@clinique-atlas.ma",
    phone: "+212 535 62 88 40",
    city: "Fès",
    address: "Avenue des FAR, Fès",
    segment: "Santé",
    vat: "MA-4408819",
    paymentTerms: "45 jours",
    outstanding: 8700,
    active: true,
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
  {
    id: "pr7",
    ref: "APR-ESS-450",
    name: "Bobine essuyage 450 formats",
    category: "Papier & essuyage",
    price: 310,
    cost: 189,
    unit: "Lot de 2",
    stock: 274,
    minStock: 90,
    description: "Bobine d'essuyage industrielle 2 plis, 450 formats prédécoupés.",
    active: true,
  },
  {
    id: "pr8",
    ref: "APR-DES-CUI",
    name: "Dégraissant cuisine HACCP 5L",
    category: "Désinfection",
    price: 395,
    cost: 231,
    unit: "Bidon",
    stock: 82,
    minStock: 70,
    description: "Dégraissant alimentaire agréé contact surfaces HACCP, cuisines professionnelles.",
    active: true,
  },
  {
    id: "pr9",
    ref: "APR-MAT-DIS",
    name: "Distributeur savon inox",
    category: "Matériel",
    price: 540,
    cost: 322,
    unit: "Unité",
    stock: 64,
    minStock: 25,
    description: "Distributeur mural inox brossé 1 L, verrouillable, pour savon moussant.",
    active: true,
  },
  {
    id: "pr10",
    ref: "APR-SOL-DET",
    name: "Détartrant sanitaires 5L",
    category: "Sols & surfaces",
    price: 265,
    cost: 158,
    unit: "Bidon",
    stock: 39,
    minStock: 50,
    description: "Détartrant acide pour sanitaires, élimine calcaire et traces de rouille.",
    active: true,
  },
  {
    id: "pr11",
    ref: "APR-MAT-AUT",
    name: "Autolaveuse compacte 45 cm",
    category: "Matériel",
    price: 28900,
    cost: 21400,
    unit: "Unité",
    stock: 4,
    minStock: 2,
    description: "Autolaveuse accompagnée sur batterie, largeur de travail 45 cm, 2 h d'autonomie.",
    active: true,
  },
  {
    id: "pr12",
    ref: "APR-DES-LIN",
    name: "Lingettes désinfectantes (x200)",
    category: "Désinfection",
    price: 129,
    cost: 74,
    unit: "Boîte",
    stock: 0,
    minStock: 60,
    description: "Lingettes imprégnées bactéricides, boîte distributrice de 200 unités.",
    active: false,
  },
];

/* ───────────────── Site WordPress connecté (simulation) ───────────────── */

export type WpMedia = {
  id: string;
  file: string;
  title: string;
  url: string;
  usedIn: string;
  /** Aperçu réel de l'image (fichier local). */
  src?: string;
  alt?: string;
  mime?: string;
  size?: string;
  dimensions?: string;
  uploadedAt?: string;
};

export type WpBlock = {
  id: string;
  label: string;
  type: "texte" | "image";
  value: string;
  /** Aperçu réel pour les blocs image. */
  src?: string;
};

export type WpPage = {
  id: string;
  title: string;
  slug: string;
  status: "Publiée" | "Brouillon";
  updatedAt: string;
  blocks: WpBlock[];
  excerpt?: string;
  cover?: string;
  views30d?: number;
  template?: string;
};

export type WpPost = {
  id: string;
  title: string;
  slug: string;
  status: "Publié" | "Brouillon";
  date: string;
  excerpt: string;
  cover?: string;
  author?: string;
  category?: string;
  readingTime?: string;
};

export type WpSite = {
  url: string;
  connected: boolean;
  name?: string;
  theme?: string;
  pages: WpPage[];
  posts: WpPost[];
  media: WpMedia[];
};

export const wpSeed: WpSite = {
  url: "https://apro.ma",
  connected: false,
  name: "APRO Hygiène — site vitrine",
  theme: "Astra Pro (enfant APRO)",
  pages: [
    {
      id: "wp1",
      title: "Accueil",
      slug: "/",
      status: "Publiée",
      updatedAt: "2026-08-01",
      excerpt: "Page d'accueil : bannière, promesse de marque et accès au catalogue.",
      cover: heroAccueil,
      views30d: 4820,
      template: "Pleine largeur",
      blocks: [
        { id: "b1", label: "Titre principal", type: "texte", value: "L'hygiène professionnelle au service du Maroc" },
        {
          id: "b2",
          label: "Sous-titre",
          type: "texte",
          value: "Produits et solutions d'hygiène pour la santé, l'hôtellerie et l'industrie.",
        },
        { id: "b3", label: "Image bannière", type: "image", value: "hero-accueil.jpg", src: heroAccueil },
        { id: "b4", label: "Bouton d'action", type: "texte", value: "Demander un devis" },
        { id: "b5", label: "Téléphone affiché", type: "texte", value: "+212 522 00 00 00" },
      ],
    },
    {
      id: "wp2",
      title: "À propos",
      slug: "/a-propos",
      status: "Publiée",
      updatedAt: "2026-07-18",
      excerpt: "Histoire de l'entreprise, équipe et engagements qualité.",
      cover: equipeApro,
      views30d: 1140,
      template: "Standard",
      blocks: [
        {
          id: "b6",
          label: "Texte À propos",
          type: "texte",
          value:
            "APRO Hygiène accompagne depuis 15 ans les professionnels marocains dans la fourniture de produits d'hygiène certifiés.",
        },
        { id: "b7", label: "Image équipe", type: "image", value: "equipe-apro.jpg", src: equipeApro },
        { id: "b8", label: "Chiffre clé", type: "texte", value: "1 200 clients professionnels accompagnés" },
      ],
    },
    {
      id: "wp3",
      title: "Catalogue produits",
      slug: "/catalogue",
      status: "Publiée",
      updatedAt: "2026-08-04",
      excerpt: "Les cinq gammes APRO : désinfection, papier, mains, sols, matériel.",
      cover: catalogueProduits,
      views30d: 3260,
      template: "Grille produits",
      blocks: [
        { id: "b9", label: "Titre principal", type: "texte", value: "Un catalogue complet, certifié et disponible" },
        { id: "b10", label: "Image catalogue", type: "image", value: "catalogue-produits.jpg", src: catalogueProduits },
        {
          id: "b11",
          label: "Texte introductif",
          type: "texte",
          value: "Plus de 240 références en stock à Casablanca, livrées sous 48 h partout au Maroc.",
        },
      ],
    },
    {
      id: "wp4",
      title: "Secteur santé",
      slug: "/secteurs/sante",
      status: "Publiée",
      updatedAt: "2026-07-29",
      excerpt: "Protocoles de désinfection pour cliniques, hôpitaux et laboratoires.",
      cover: secteurSante,
      views30d: 890,
      template: "Landing secteur",
      blocks: [
        { id: "b12", label: "Titre principal", type: "texte", value: "Protocoles de désinfection en milieu de soins" },
        { id: "b13", label: "Image secteur", type: "image", value: "secteur-sante.jpg", src: secteurSante },
        {
          id: "b14",
          label: "Texte secteur",
          type: "texte",
          value: "Produits conformes EN 14476 et EN 13727, traçabilité complète des lots livrés.",
        },
      ],
    },
    {
      id: "wp5",
      title: "Secteur restauration",
      slug: "/secteurs/restauration",
      status: "Brouillon",
      updatedAt: "2026-08-05",
      excerpt: "Offre HACCP pour cuisines professionnelles — page en cours de rédaction.",
      cover: secteurRestauration,
      views30d: 0,
      template: "Landing secteur",
      blocks: [
        { id: "b15", label: "Titre principal", type: "texte", value: "Hygiène HACCP en cuisine professionnelle" },
        { id: "b16", label: "Image secteur", type: "image", value: "secteur-restauration.jpg", src: secteurRestauration },
        { id: "b17", label: "Texte secteur", type: "texte", value: "Contenu à compléter avant publication." },
      ],
    },
    {
      id: "wp6",
      title: "Contact",
      slug: "/contact",
      status: "Publiée",
      updatedAt: "2026-06-30",
      excerpt: "Coordonnées, formulaire de devis et plan d'accès.",
      cover: secteurHotellerie,
      views30d: 1470,
      template: "Contact",
      blocks: [
        { id: "b18", label: "Téléphone", type: "texte", value: "+212 522 00 00 00" },
        { id: "b19", label: "E-mail", type: "texte", value: "contact@apro.ma" },
        { id: "b20", label: "Adresse", type: "texte", value: "Zone industrielle, Casablanca, Maroc" },
        { id: "b21", label: "Horaires", type: "texte", value: "Lundi – vendredi, 8h30 – 18h00" },
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
      cover: secteurSante,
      author: "Dr. Nadia Bennani",
      category: "Santé",
      readingTime: "6 min",
    },
    {
      id: "po2",
      title: "Hygiène en restauration : les 5 réflexes",
      slug: "/blog/hygiene-restauration",
      status: "Publié",
      date: "2026-06-14",
      excerpt: "Les gestes essentiels pour rester conforme aux contrôles sanitaires.",
      cover: secteurRestauration,
      author: "Karim Idrissi",
      category: "Restauration",
      readingTime: "4 min",
    },
    {
      id: "po3",
      title: "Housekeeping : réduire les coûts sans baisser la qualité",
      slug: "/blog/housekeeping-couts",
      status: "Publié",
      date: "2026-05-28",
      excerpt: "Dosage automatique, formation des équipes et suivi des consommations à l'hôtel.",
      cover: secteurHotellerie,
      author: "Sanaa El Fassi",
      category: "Hôtellerie",
      readingTime: "5 min",
    },
    {
      id: "po4",
      title: "Nouveautés catalogue 2026",
      slug: "/blog/catalogue-2026",
      status: "Brouillon",
      date: "2026-08-02",
      excerpt: "Aperçu des nouvelles gammes disponibles à la rentrée.",
      cover: catalogueProduits,
      author: "Équipe APRO",
      category: "Actualités",
      readingTime: "3 min",
    },
  ],
  media: [
    {
      id: "m1",
      file: "hero-accueil.jpg",
      title: "Bannière accueil",
      url: "/wp-content/uploads/2026/08/hero-accueil.jpg",
      usedIn: "Accueil",
      src: heroAccueil,
      alt: "Agent d'hygiène professionnel en tenue bleue",
      mime: "image/jpeg",
      size: "482 Ko",
      dimensions: "1024 × 576",
      uploadedAt: "2026-08-01",
    },
    {
      id: "m2",
      file: "equipe-apro.jpg",
      title: "Équipe APRO",
      url: "/wp-content/uploads/2026/07/equipe-apro.jpg",
      usedIn: "À propos",
      src: equipeApro,
      alt: "Équipe APRO Hygiène dans l'entrepôt",
      mime: "image/jpeg",
      size: "521 Ko",
      dimensions: "1024 × 576",
      uploadedAt: "2026-07-18",
    },
    {
      id: "m3",
      file: "catalogue-produits.jpg",
      title: "Gammes de produits",
      url: "/wp-content/uploads/2026/08/catalogue-produits.jpg",
      usedIn: "Catalogue produits",
      src: catalogueProduits,
      alt: "Produits d'hygiène professionnels sur fond blanc",
      mime: "image/jpeg",
      size: "394 Ko",
      dimensions: "1024 × 576",
      uploadedAt: "2026-08-04",
    },
    {
      id: "m4",
      file: "secteur-sante.jpg",
      title: "Secteur santé",
      url: "/wp-content/uploads/2026/07/secteur-sante.jpg",
      usedIn: "Secteur santé, Blog",
      src: secteurSante,
      alt: "Couloir d'hôpital en cours de désinfection",
      mime: "image/jpeg",
      size: "463 Ko",
      dimensions: "1024 × 576",
      uploadedAt: "2026-07-29",
    },
    {
      id: "m5",
      file: "secteur-restauration.jpg",
      title: "Secteur restauration",
      url: "/wp-content/uploads/2026/08/secteur-restauration.jpg",
      usedIn: "Secteur restauration, Blog",
      src: secteurRestauration,
      alt: "Cuisine professionnelle nettoyée par un chef",
      mime: "image/jpeg",
      size: "508 Ko",
      dimensions: "1024 × 576",
      uploadedAt: "2026-08-05",
    },
    {
      id: "m6",
      file: "secteur-hotellerie.jpg",
      title: "Secteur hôtellerie",
      url: "/wp-content/uploads/2026/05/secteur-hotellerie.jpg",
      usedIn: "Contact, Blog",
      src: secteurHotellerie,
      alt: "Chambre d'hôtel préparée par le personnel d'étage",
      mime: "image/jpeg",
      size: "537 Ko",
      dimensions: "1024 × 576",
      uploadedAt: "2026-05-28",
    },
    {
      id: "m7",
      file: "catalogue-2026.pdf",
      title: "Catalogue 2026 (PDF)",
      url: "/wp-content/uploads/2026/08/catalogue-2026.pdf",
      usedIn: "Ressources",
      mime: "application/pdf",
      size: "3,4 Mo",
      uploadedAt: "2026-08-02",
    },
    {
      id: "m8",
      file: "fiche-securite-des-5l.pdf",
      title: "Fiche de sécurité — Désinfectant 5L",
      url: "/wp-content/uploads/2026/06/fiche-securite-des-5l.pdf",
      usedIn: "Catalogue produits",
      mime: "application/pdf",
      size: "820 Ko",
      uploadedAt: "2026-06-11",
    },
  ],
};
