import { Decodeur } from "./decodeur.js";
import { none, Option, some } from "./libs/option.js";
import { error, flatMap, mapError, Result, tryCatch } from "./libs/result.js";

export const moi = {
  nom: "???",
  cip: "???",
};

// METHODES
export type MethodeSansCorps = "GET" | "DELETE" | "HEAD";
export type MethodeAvecCorps = "POST" | "PUT" | "PATCH";
export type MethodeHttp = string; // À remplacer par un type somme

// CORPS
export type CorpsHttp = {}; // À remplacer par un type algébrique tel que défini dans l'énoncé

export function corpsVide(): CorpsHttp {
  // À faire
  return null as unknown as CorpsHttp;
}

export function corpsTexte(texte: string): CorpsHttp {
  // À faire
  return null as unknown as CorpsHttp;
}

export function corpsJson(contenu: unknown): CorpsHttp {
  // À faire
  return null as unknown as CorpsHttp;
}

export function texteCorps(corps: CorpsHttp): Option<string> {
  // À faire : retourne some(texte) si le corps est de type texte, none sinon
  return none;
}

export function jsonCorps(corps: CorpsHttp): Option<unknown> {
  // À faire : retourne some(contenu) si le corps est de type json, none sinon
  return none;
}

// EN-TETES
export type EnTetes = Readonly<Record<string, string>>;

export function ajouterEnTete(req: Requete, cle: string, valeur: string): Requete {
  // À faire
  return null as unknown as Requete;
}

// URL
declare const MarqueUrl: unique symbol;
export type UrlHttp = { readonly [MarqueUrl]: true };

export interface InternalUrlHttp {
  readonly protocole: string;
  readonly domaine: string;
  readonly port: Option<string>;
  readonly chemin: string;
}

export function parserUrl(url: string): Result<ErreurValidation, UrlHttp> {
  // À faire
  return null as unknown as Result<ErreurValidation, UrlHttp>;
}

export function serialiserUrl(urlHttp: UrlHttp): string {
  // À faire
  return "";
}

export function protocole(url: UrlHttp): string {
  // À faire
  return "";
}

export function domaine(url: UrlHttp): string {
  // À faire
  return "";
}

export function port(url: UrlHttp): Option<string> {
  // À faire
  return some("");
}

export function chemin(url: UrlHttp): string {
  // À faire
  return "";
}

// REQUETES
// À faire
export type RequeteSansCorps = {};

// À faire
export type RequeteAvecCorps = {};

export type Requete = RequeteSansCorps | RequeteAvecCorps;

export function requeteSansCorps(methode: MethodeSansCorps, url: UrlHttp): RequeteSansCorps {
  // À faire
  return null as unknown as RequeteSansCorps;
}

export function requeteAvecCorps(methode: MethodeAvecCorps, url: UrlHttp, corps: CorpsHttp): RequeteAvecCorps {
  // À faire
  return null as unknown as RequeteAvecCorps;
}

export function methode(req: Requete): MethodeHttp {
  // À faire
  return "GET";
}

export function url(req: Requete): UrlHttp {
  // À faire
  return null as unknown as UrlHttp;
}

export function entetes(req: Requete): EnTetes {
  // À faire
  return {};
}

export function corps(req: Requete): Option<CorpsHttp> {
  // À faire : retourne some(corps) si la requête possède un corps, none sinon
  return none;
}

// REPONSE
export interface Reponse {
  readonly statut: number;
  readonly statutTexte: string;
  readonly entetes: EnTetes;
  readonly corps: string;
}

// ERREURS
export type ErreurValidation =
  | { readonly code: "ProtocoleInvalide"; readonly url: string }
  | { readonly code: "UrlInvalide"; readonly url: string; readonly raison: string };

export type ErreurExecution =
  | { readonly code: "ErreurClient"; readonly statut: number; readonly reponse: Reponse } // 4xx
  | { readonly code: "ErreurServeur"; readonly statut: number; readonly reponse: Reponse } // 5xx
  | { readonly code: "ErreurInatendue"; readonly message: string }
  | { readonly code: "ErreurDecodage"; readonly message: string; readonly corps: string }
  | { readonly code: "ErreurReseau"; readonly message: string };

export type ErreurHttp = ErreurValidation | ErreurExecution;

// Interface à implémenter pour simuler la requête
export interface ContexteHttp {
  readonly executerTransport: (requete: Requete) => Reponse;
}

export function analyserReponse(rep: Reponse): Result<ErreurExecution, Reponse> {
  return null as unknown as Result<ErreurExecution, Reponse>;
}

export type ConfigDecodeurs<T> = Partial<Record<"json" | "texte" | "vide", Decodeur<T>>>;

/**
 * Décode la réponse HTTP en fonction de ses en-têtes (Content-Type / Content-Length).
 */
export function decoderReponse<T>(rep: Reponse, configDecodeurs: ConfigDecodeurs<T>): Result<ErreurExecution, T> {
  const len = rep.entetes["content-length"] ?? rep.entetes["Content-Length"];
  if (len === "0" || rep.corps.trim().length === 0) {
    const decodeur = configDecodeurs["vide"];
    if (!decodeur) {
      return error({
        code: "ErreurDecodage",
        message: "Aucun décodeur pour corps vide",
        corps: rep.corps,
      });
    }

    return mapError(decodeur(undefined), (e) => ({
      code: "ErreurDecodage",
      message: e,
      corps: rep.corps,
    }));
  }

  const typeContenu = rep.entetes["content-type"] ?? rep.entetes["Content-Type"] ?? "";
  const mime = typeContenu.split(";")[0].trim().toLowerCase();

  if (mime === "application/json") {
    const decodeur = configDecodeurs["json"];
    if (!decodeur) {
      return error({
        code: "ErreurDecodage",
        message: "Aucun décodeur pour corps JSON",
        corps: rep.corps,
      });
    }

    const resParse = tryCatch(
      () => JSON.parse(rep.corps),
      (e) => String(e),
    );

    return mapError<string, ErreurExecution, T>(
      flatMap(resParse, (json) => decodeur(json)),
      (e) => ({
        code: "ErreurDecodage",
        message: e,
        corps: rep.corps,
      }),
    );
  }

  if (mime.startsWith("text/")) {
    const decodeur = configDecodeurs["texte"];
    if (!decodeur) {
      return error({
        code: "ErreurDecodage",
        message: "Aucun décodeur pour corps texte",
        corps: rep.corps,
      });
    }

    return mapError(decodeur(rep.corps), (e) => ({
      code: "ErreurDecodage",
      message: e,
      corps: rep.corps,
    }));
  }

  return error({
    code: "ErreurInatendue",
    message: "Type de contenu non supporté",
  });
}

/**
 * Exécute la requete (via le contexte), analyse la réponse, puis décode le corps.
 * @param contexte: implémentation du contexte HTTP qui exécute la requête
 * @param requete: requête HTTP
 * @param configDecodeurs: la suite de décodeurs à utiliser selon le contenu de la réponse
 * @returns un Result: une erreur ou le contenu décodé
 */
export function executerRequete<T>(
  contexte: ContexteHttp,
  requete: Requete,
  configDecodeurs: ConfigDecodeurs<T>,
): Result<ErreurHttp, T> {
  // À faire
  return null as unknown as Result<ErreurHttp, T>;
}
