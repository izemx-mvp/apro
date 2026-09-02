import { z } from "zod";

/** Catalogue des outils exposés à l'IA. Partagé entre la route serveur et l'exécuteur client. */

export const entityEnum = z.enum(["client", "produit", "lead", "devis", "commande", "relance"]);

export const aiToolSchemas = {
  list_records: {
    description:
      "Lister les enregistrements d'une entité de la plateforme (clients, produits, leads, devis, commandes, relances). Filtre texte optionnel.",
    inputSchema: z.object({
      entity: entityEnum,
      filter: z.string().optional().describe("Texte de recherche libre (ville, statut, mois, nom…)"),
    }),
  },
  get_record: {
    description: "Récupérer la fiche détaillée d'un enregistrement à partir d'un nom, d'une référence ou d'un identifiant.",
    inputSchema: z.object({ entity: entityEnum, query: z.string() }),
  },
  get_stats: {
    description: "Synthèse chiffrée de l'activité (CA, clients, devis, encours).",
    inputSchema: z.object({}),
  },
  create_record: {
    description:
      "Créer un nouvel enregistrement. Demander d'abord les informations obligatoires manquantes (au minimum le nom). L'utilisateur devra confirmer.",
    inputSchema: z.object({
      entity: entityEnum,
      name: z.string().describe("Nom, société ou client concerné"),
      contact: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      city: z.string().optional(),
      address: z.string().optional(),
      price: z.string().optional(),
      stock: z.string().optional(),
      amount: z.string().optional(),
      items: z.string().optional(),
      description: z.string().optional(),
      interest: z.string().optional(),
    }),
  },
  update_record: {
    description:
      "Modifier un champ d'un enregistrement existant. 'field' doit être un nom de champ technique (email, phone, name, city, address, contact, segment, price, cost, stock, category, description, status, amount, score, interest, channel, reply, note).",
    inputSchema: z.object({
      entity: entityEnum,
      query: z.string().describe("Nom ou référence de l'enregistrement à modifier"),
      field: z.string(),
      value: z.string(),
    }),
  },
  delete_record: {
    description: "Supprimer un enregistrement. Action destructive : l'utilisateur devra confirmer.",
    inputSchema: z.object({ entity: entityEnum, query: z.string() }),
  },
  wp_status: {
    description: "Vérifier l'état de la connexion au site WordPress du client.",
    inputSchema: z.object({}),
  },
  wp_list: {
    description: "Lister le contenu du site WordPress connecté : pages, articles ou médias.",
    inputSchema: z.object({ kind: z.enum(["pages", "articles", "medias"]) }),
  },
  wp_get_page: {
    description: "Lire le contenu actuel d'une page du site (titre, textes, images).",
    inputSchema: z.object({ page: z.string().describe("Titre ou slug de la page, ex : accueil") }),
  },
  wp_update_text: {
    description:
      "Modifier un texte du site WordPress. L'utilisateur verra un aperçu avant/après et devra confirmer. Renseigner 'search' avec le texte exact à remplacer lorsque l'utilisateur le précise.",
    inputSchema: z.object({
      page: z.string(),
      block: z.string().describe("Élément visé : titre, contenu, description, téléphone…"),
      value: z.string().describe("Nouveau texte"),
      search: z.string().optional().describe("Texte exact actuellement présent sur la page, à remplacer"),
    }),
  },
  wp_replace_image: {
    description:
      "Remplacer une image du site WordPress par le fichier envoyé dans la conversation. Utiliser après un envoi d'image par l'utilisateur.",
    inputSchema: z.object({
      page: z.string(),
      block: z.string().optional().describe("Emplacement visé : bannière, hero, illustration…"),
      file: z.string().optional().describe("Nom du fichier envoyé"),
    }),
  },
  wp_create_page: {
    description: "Créer une nouvelle page sur le site WordPress (brouillon).",
    inputSchema: z.object({ title: z.string(), content: z.string().optional() }),
  },
  wp_delete_page: {
    description: "Supprimer une page du site WordPress. Action destructive : confirmation obligatoire.",
    inputSchema: z.object({ page: z.string() }),
  },
  wp_publish: {
    description: "Publier une page WordPress actuellement en brouillon.",
    inputSchema: z.object({ page: z.string() }),
  },
} as const;

export type AiToolName = keyof typeof aiToolSchemas;

/** Outils en lecture seule : exécutés immédiatement, sans confirmation. */
export const readOnlyTools: AiToolName[] = [
  "list_records",
  "get_record",
  "get_stats",
  "wp_status",
  "wp_list",
  "wp_get_page",
];

/** Outils destructifs : confirmation explicite obligatoire. */
export const destructiveTools: AiToolName[] = ["delete_record", "wp_delete_page", "wp_replace_image"];

export const isWriteTool = (name: string) => !readOnlyTools.includes(name as AiToolName);

export const toolLabel: Record<AiToolName, string> = {
  list_records: "Lecture de la liste",
  get_record: "Lecture d'une fiche",
  get_stats: "Synthèse d'activité",
  create_record: "Création d'un enregistrement",
  update_record: "Modification d'un enregistrement",
  delete_record: "Suppression d'un enregistrement",
  wp_status: "État du site web",
  wp_list: "Contenu du site web",
  wp_get_page: "Lecture d'une page",
  wp_update_text: "Modification d'un texte du site",
  wp_replace_image: "Remplacement d'une image du site",
  wp_create_page: "Création d'une page",
  wp_delete_page: "Suppression d'une page",
  wp_publish: "Publication d'une page",
};

/** Étapes d'exécution affichées dans le fil de conversation. */
export const toolSteps: Record<AiToolName, string[]> = {
  list_records: ["Analyse de la demande", "Interrogation de la base", "Mise en forme"],
  get_record: ["Analyse de la demande", "Recherche de l'enregistrement", "Mise en forme"],
  get_stats: ["Agrégation des données", "Calcul des indicateurs"],
  create_record: ["Contrôle des champs", "Vérification des droits", "Création", "Vérification"],
  update_record: ["Localisation de l'enregistrement", "Vérification des droits", "Mise à jour", "Vérification"],
  delete_record: ["Localisation de l'enregistrement", "Vérification des droits", "Suppression"],
  wp_status: ["Contrôle de la connexion WordPress"],
  wp_list: ["Connexion au site", "Récupération du contenu"],
  wp_get_page: ["Connexion au site", "Lecture de la page"],
  wp_update_text: ["Identification de la page", "Localisation du bloc", "Mise à jour du site", "Vérification"],
  wp_replace_image: [
    "Identification de la page",
    "Localisation de l'image",
    "Envoi du média",
    "Mise à jour du site",
    "Vérification",
  ],
  wp_create_page: ["Préparation de la page", "Création sur le site"],
  wp_delete_page: ["Identification de la page", "Suppression sur le site"],
  wp_publish: ["Identification de la page", "Publication"],
};
