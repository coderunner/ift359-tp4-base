import { Result } from "./libs/result.js";
import { ContexteHttp, ErreurHttp } from "./http-client-api.js";
import { Decodeur } from "./decodeur.js";

// ============================================================================
// Modèles et Décodeurs
// ============================================================================

export interface Profil {
  readonly id: string;
  readonly nom: string;
}

export interface Commande {
  readonly id: string;
  readonly profilId: string;
  readonly description: string;
  readonly montant: number;
}

// À l'aide des décodeurs dans le fichier decodeur.ts, implémenter ces décodeurs
export const decodeurProfil: Decodeur<Profil> = null as unknown as Decodeur<Profil>;
export const decodeurCommande: Decodeur<Commande> = null as unknown as Decodeur<Commande>;
export const decodeurListeProfils: Decodeur<readonly Profil[]> = null as unknown as Decodeur<readonly Profil[]>;
export const decodeurListeCommandes: Decodeur<readonly Commande[]> = null as unknown as Decodeur<readonly Commande[]>;

/**
 * Scénario 1 : Consulter une commande par son identifiant direct
 * GET sur https://api.domaine.com/commandes/${commandeId}
 */
export function scenarioConsulterCommande(contexte: ContexteHttp, commandeId: string): Result<ErreurHttp, Commande> {
  // À faire
  return null as unknown as Result<ErreurHttp, Commande>;
}

/**
 * Scénario 2 : Création d'une nouvelle commande pour un profil
 * POST sur https://api.domaine.com/profils/${profilId}/commandes
 * avec l'en-tête "content-type" à "application/json"
 * et le corps JSON { description, montant }.
 */
export function scenarioCreerCommande(
  contexte: ContexteHttp,
  profilId: string,
  description: string,
  montant: number,
): Result<ErreurHttp, Commande> {
  // À faire
  return null as unknown as Result<ErreurHttp, Commande>;
}

/**
 * Scénario 3 : Récupérer les commandes du premier profil disponible
 * 1. GET sur https://api.domaine.com/profils -> liste de profils
 * 2. Prendre le premier profil de la liste (s'il existe), sinon retourner l'erreur "AucunProfil"
 * 3. GET sur https://api.domaine.com/profils/${premier.id}/commandes -> liste de commandes
 */
export function scenarioCommandesPremierProfil(
  contexte: ContexteHttp,
): Result<ErreurHttp | "AucunProfil", readonly Commande[]> {
  // À faire
  return null as unknown as Result<ErreurHttp | "AucunProfil", readonly Commande[]>;
}
