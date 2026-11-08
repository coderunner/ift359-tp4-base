import {
  type ContexteHttp,
  type Requete,
  type Reponse,
  chemin,
  url,
  methode,
  entetes,
  corps,
  jsonCorps,
  serialiserUrl,
} from "./http-client-api.js";
import { flatMap, isNone } from "./libs/option.js";

const profilsEnMemoire = [
  { id: "1", nom: "Alice" },
  { id: "2", nom: "Bob" },
] as const;

const commandesEnMemoire = [
  { id: "CMD-1", profilId: "1", description: "Livre TypeScript", montant: 45.0 },
  { id: "CMD-2", profilId: "1", description: "Clavier mécanique", montant: 120.0 },
  { id: "CMD-3", profilId: "2", description: "Écran 4K", montant: 350.0 },
] as const;

export function reponseJson(statut: number, statutTexte: string, corps: unknown): Reponse {
  const corpsBrut = JSON.stringify(corps);
  return {
    statut,
    statutTexte,
    entetes: {
      "content-type": "application/json",
      "content-length": String(corpsBrut.length),
    },
    corps: corpsBrut,
  };
}

// ============================================================================
// Bouchon ContexteHttp
// ============================================================================
export const mockContexteHttp: ContexteHttp = {
  executerTransport: (req: Requete): Reponse => {
    const urlReq = url(req);
    const methodeReq = methode(req);

    // GET /profils
    if (methodeReq === "GET" && chemin(urlReq) === "/profils") {
      return reponseJson(200, "OK", profilsEnMemoire);
    }

    // GET /profils/${id}/commandes
    const matchGetCommandesProfil = chemin(urlReq).match(/\/profils\/([^/]+)\/commandes$/);
    if (methodeReq === "GET" && matchGetCommandesProfil) {
      const profilId = matchGetCommandesProfil[1];
      const commandes = commandesEnMemoire.filter((c) => c.profilId === profilId);
      return reponseJson(200, "OK", commandes);
    }

    // GET /commandes/${id}
    const matchGetCommandeUnique = chemin(urlReq).match(/\/commandes\/([^/]+)$/);
    if (methodeReq === "GET" && matchGetCommandeUnique) {
      const commandeId = matchGetCommandeUnique[1];
      const commande = commandesEnMemoire.find((c) => c.id === commandeId);

      return commande
        ? reponseJson(200, "OK", commande)
        : reponseJson(404, "Not Found", { message: `Commande introuvable: ${commandeId}` });
    }

    // POST /profils/${id}/commandes
    const matchPostCommandeProfil = chemin(urlReq).match(/\/profils\/([^/]+)\/commandes$/);
    if (methodeReq === "POST" && matchPostCommandeProfil) {
      const profilId = matchPostCommandeProfil[1];
      const profilExiste = profilsEnMemoire.some((p) => p.id === profilId);

      if (!profilExiste) {
        return reponseJson(404, "Not Found", { message: `Profil inexistant: ${profilId}` });
      }

      if (entetes(req)["content-type"] !== "application/json") {
        return reponseJson(400, "Bad Request", { message: "En-tête content-type: application/json requis" });
      }

      const optJson = flatMap(corps(req), jsonCorps);
      if (isNone(optJson)) {
        return reponseJson(400, "Bad Request", { message: "Corps JSON requis" });
      }

      const contenu = optJson.valeur as Record<string, unknown>;
      const nouvelleCommande = {
        id: `CMD-${Date.now()}`,
        profilId,
        description: String(contenu.description ?? "Sans description"),
        montant: Number(contenu.montant ?? 0),
      };

      return reponseJson(201, "Created", nouvelleCommande);
    }

    // Route non reconnue
    return reponseJson(404, "Not Found", {
      message: `Route non supportée: ${methodeReq} ${serialiserUrl(urlReq)}`,
    });
  },
};
