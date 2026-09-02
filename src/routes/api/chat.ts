import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, stepCountIs, streamText, tool, type UIMessage } from "ai";

import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { aiToolSchemas, type AiToolName } from "@/lib/copilote/ai-tools";

type ChatBody = {
  messages?: UIMessage[];
  context?: string;
  role?: string;
  wpConnected?: boolean;
};

const SYSTEM = (context: string, role: string, wpConnected: boolean) => `
Tu es le Copilote IA d'APRO Hygiène, un assistant intégré au back-office de la plateforme.
Tu réponds toujours en français, de façon concise, professionnelle et naturelle.

Tu peux LIRE, CRÉER, MODIFIER et SUPPRIMER des données de la plateforme, et gérer le site
web WordPress du client, uniquement via les outils qui te sont fournis. N'invente jamais un
résultat : si tu n'as pas appelé l'outil, tu ne connais pas la réponse.

Règles :
- Comprends l'intention en langage naturel. Aucune commande spéciale n'est requise.
- Utilise le contexte de la conversation : « son e-mail », « ce client », « cette page » font
  référence à l'élément évoqué précédemment.
- Avant de créer un enregistrement, vérifie que les informations indispensables sont présentes.
  Demande UNIQUEMENT ce qui manque réellement, en une seule question.
- Les actions d'écriture et de suppression déclenchent automatiquement une carte de confirmation
  côté interface : n'invente pas de bouton, ne redemande pas « voulez-vous confirmer ? » par écrit,
  appelle simplement l'outil.
- Après l'exécution d'un outil, résume en une ou deux phrases ce qui a été fait ou trouvé.
  Ne répète pas les tableaux : ils sont déjà affichés.
- Si une action échoue, explique la cause en langage courant et propose une solution.
- Rôle de l'utilisateur connecté : ${role}. ${
  role === "Lecteur"
    ? "Ce profil est en lecture seule : refuse poliment toute action d'écriture."
    : "Ce profil peut lire et modifier les données."
}
- Site WordPress : ${wpConnected ? "connecté (les modifications sont réelles)." : "non connecté à ce jour ; les outils du site fonctionnent sur l'espace de démonstration interne et tu dois le préciser."}

État actuel de la plateforme (pour identifier les enregistrements ; utilise toujours les outils
pour obtenir les valeurs exactes) :
${context}
`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as ChatBody;
        if (!Array.isArray(body.messages)) {
          return new Response("Messages requis", { status: 400 });
        }

        const key = process.env["LOVABLE_API_KEY"];
        if (!key) return new Response("LOVABLE_API_KEY manquante", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);

        // Outils sans `execute` : ils sont exécutés côté application (données + WordPress),
        // après contrôle des permissions et confirmation de l'utilisateur.
        const tools = Object.fromEntries(
          (Object.keys(aiToolSchemas) as AiToolName[]).map((name) => [
            name,
            tool({
              description: aiToolSchemas[name].description,
              inputSchema: aiToolSchemas[name].inputSchema,
            }),
          ]),
        );

        try {
          const result = streamText({
            model: gateway("google/gemini-3.7-flash"),
            system: SYSTEM(body.context ?? "—", body.role ?? "Administrateur", !!body.wpConnected),
            messages: await convertToModelMessages(body.messages),
            tools,
            stopWhen: stepCountIs(50),
          });

          return result.toUIMessageStreamResponse({
            originalMessages: body.messages,
            onError: (error) => {
              const message = error instanceof Error ? error.message : String(error);
              if (message.includes("429"))
                return "Trop de demandes en même temps. Patientez quelques secondes puis réessayez.";
              if (message.includes("402"))
                return "Le crédit IA de l'espace de travail est épuisé. Ajoutez des crédits dans Lovable pour continuer.";
              return `Le Copilote n'a pas pu répondre : ${message}`;
            },
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return new Response(message, { status: 500 });
        }
      },
    },
  },
});
