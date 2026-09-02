# APRO Command Center

PROMPT LOVABLE — APRO Hygiène Back-office

Build a professional back-office dashboard for APRO Hygiène, a hygiene and cleaning products B2B company in Morocco. The design should use a clean white background, deep navy blue (#1A2E5E) as the primary color, and electric cyan/teal (#0EA5E9) as the accent color, with a left sidebar navigation and top header. Use Tailwind CSS utility classes only.

The app has 6 modules accessible from the sidebar:

1. Dashboard
Central command view showing:

4 KPI cards: active leads today, quotes pending, orders in progress, Odoo sync status (green/red indicator)

A 30-day activity chart (leads captured vs quotes sent vs orders placed)

A "Priority actions" feed: quotes expiring in 24h, unqualified leads waiting review, Odoo sync errors

Quick shortcuts to: New Lead, Create Quote, View Odoo Sync Log

2. Leads & Qualification
Full lead pipeline view:

Kanban board with 4 columns: Nouveau → En qualification → Qualifié → Hors sujet

Each card shows: company name, contact name, channel (WhatsApp / Site Web), product interest, date captured

Click on a card → opens a right drawer with: full conversation history from WhatsApp/website, qualification score (0–100), AI summary of the request, product interest detected, recommended action

Top actions bar: Filter by channel, filter by status, search by company name

Button: "Mark as Qualified" → triggers Odoo account creation flow

Button: "Mark as Hors Sujet" → archives the lead with reason

3. Devis & Commandes
Full commercial pipeline:

Table view with: client name, quote reference, amount (MAD), status (Brouillon / Envoyé / En attente / Accepté / Refusé / Expiré), Odoo sync status, date

Filters: by status, by date range, by client

Click on a row → opens detail panel: quote lines (product, qty, unit price, total), client info, Odoo link, AI-drafted follow-up email (editable, Approve & Send button)

Relance automatique section: configure delay rules (ex: relance à J+3 si pas de réponse) — toggle per quote

Button: "Créer un devis" → form with client selector, product catalog (synced from Odoo), quantities, pricing

4. Agent Copilote Odoo
The internal AI assistant panel:

Chat interface in the center: text input + mic icon (voice command) — user types or speaks a request like "Donne-moi le bilan des ventes du mois de juin" or "Vérifie le stock des produits de nettoyage sol"

The agent replies with a formatted response: table of results, KPI summary, or confirmation of action taken

Below the chat: "Actions automatisées Odoo" section showing recent automations run:

Each row: action type (Vérification stock / Validation commande / Relance devis), trigger, status (✓ Exécuté / ⚠ Erreur), timestamp

Click → full log detail

Sidebar within this module: "Configurer les automatisations" — list of active automation rules with toggle on/off, edit trigger, edit action

5. Agent Service Client
The external agent management panel — 3 tabs:

Tab 1 — Conversations

List of all active conversations: client/prospect name, channel (WhatsApp / Site Web), last message preview, status (En cours IA / Transféré humain / Résolu), unread badge

Click → opens full conversation thread on the right

In the thread: message history, below it: "Prendre le contrôle" button (transfers to human), "Marquer comme résolu", "Transférer à un commercial"

Manual reply input at the bottom (disabled if in AI mode)

Tab 2 — Base de connaissances

Sections: Catalogue produits (synced from Odoo), Tarifs, Procédures APRO, FAQ

Each section: list of entries with status Active / Inactive — only Active entries are used by the AI agent

Add / Edit / Delete entries

"Synchroniser depuis Odoo" button for products and pricing

Tab 3 — Configuration

Agent behavior settings: greeting message, qualification questions (add/remove/reorder), escalation rules (when to transfer to human), working hours

6. Paramètres

Intégrations: Odoo connection status + API key config, WhatsApp Business connection (toggle + config), Site Web chatbot embed code (copy button)

Utilisateurs: list of back-office users with roles (Admin / Commercial / Lecteur), CRUD

Permissions matrix: per module, per role (Read / Write / Delete)

Notifications: configure which events trigger internal alerts (new qualified lead, Odoo sync error, quote expiring)

Design requirements:

Left sidebar: logo "APRO" at top, nav icons + labels for each module, user avatar + name at bottom

Top header: page title, global search bar, notification bell with badge, Odoo sync indicator (pulsing dot — green if synced, red if error)

All tables: striped rows, hover highlight, sortable columns

All drawers: slide in from right, 480px wide, close with X or Escape

Empty states: illustrated with a short message, no blank screens

Loading states: skeleton loaders

All currency in MAD

French language throughout

Dark mode toggle in header

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/82a27d44-0de3-4d4a-8f8c-cf7da6a1b9f0).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
