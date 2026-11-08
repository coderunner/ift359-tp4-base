import { error, flatMap, map, Result, value } from "./libs/result.js";

export type Decodeur<A> = (v: unknown) => Result<string, A>;

function estString(v: unknown): v is string {
  return false; // À faire
}

function estNumber(v: unknown): v is number {
  return false; // À faire
}

function estBoolean(v: unknown): v is boolean {
  return false; // À faire
}

function estObject(v: unknown): v is Record<string, unknown> {
  return false; // À faire
}

function estTableau(v: unknown): v is unknown[] {
  return false; // À faire
}

function aPropriete<K extends string>(obj: Record<string, unknown>, cle: K): obj is Record<K, unknown> {
  return false; // À faire
}

/**
 * Retourne un Result: une erreur si v n'est pas une string, sinon v
 */
export const decodeString: Decodeur<string> = (v: unknown) => {
  // À faire
  return value("");
};

/**
 * Retourne un Result: une erreur si v n'est pas un number, sinon v
 */
export const decodeNumber: Decodeur<number> = (v: unknown) => {
  // À faire
  return value(0);
};

/**
 * Retourne un Result: une erreur si v n'est pas un boolean, sinon v
 */
export const decodeBoolean: Decodeur<boolean> = (v: unknown) => {
  // À faire
  return value(true);
};

/**
 * Retourne un Decodeur qui retourne une erreur si v n'est pas un objet ou s'il ne contient pas la cle, sinon la valeur associée à la cle.
 */
export function decodeProp<A>(cle: string, decodeur: Decodeur<A>): Decodeur<A> {
  // À faire
  return null as unknown as Decodeur<A>;
}

/**
 * Retourne un Decodeur qui retourne une erreur si v n'est pas un tableau ou si un élément échoue au décodage, sinon le tableau décodé.
 */
export function decodeTableau<A>(decodeur: Decodeur<A>): Decodeur<A[]> {
  // À faire
  return null as unknown as Decodeur<A[]>;
}

/**
 * Retourne un Decodeur qui utilise 2 décodeurs et combine leur résultat à l'aide de la fonction f.
 */
export function combiner<A, B, R>(decA: Decodeur<A>, decB: Decodeur<B>, f: (a: A, b: B) => R): Decodeur<R> {
  // À faire
  return null as unknown as Decodeur<R>;
}
