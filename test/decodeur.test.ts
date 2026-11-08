import { describe, it, expect, vi } from "vitest";
import { isError, value } from "../src/libs/result.js";
import {
  decodeString,
  decodeNumber,
  decodeBoolean,
  decodeProp,
  decodeTableau,
  combiner,
  type Decodeur,
} from "../src/decodeur.js";

describe("Décodeurs Primitifs (decodeString, decodeNumber, decodeBoolean)", () => {
  it("valide et extrait correctement les chaînes de caractères", () => {
    expect(decodeString("bonjour")).toEqual(value("bonjour"));
    expect(isError(decodeString(42))).toBe(true);
    expect(isError(decodeString(null))).toBe(true);
  });

  it("valide et extrait les nombres", () => {
    expect(decodeNumber(42)).toEqual(value(42));
    expect(decodeNumber(0)).toEqual(value(0));
    expect(decodeNumber(-3.14)).toEqual(value(-3.14));

    expect(isError(decodeNumber("42"))).toBe(true);
  });

  it("valide et extrait les booléens", () => {
    expect(decodeBoolean(true)).toEqual(value(true));
    expect(decodeBoolean(false)).toEqual(value(false));

    expect(isError(decodeBoolean("true"))).toBe(true);
    expect(isError(decodeBoolean(1))).toBe(true);
  });
});

describe("Combinateur decodeProp", () => {
  it("extrait une propriété existante et valide son type", () => {
    const decNom = decodeProp("nom", decodeString);
    const donnees = { nom: "Alice", age: 30 };

    expect(decNom(donnees)).toEqual(value("Alice"));
  });

  it("échoue si la clé est absente de l'objet", () => {
    const decAge = decodeProp("age", decodeNumber);
    const donnees = { nom: "Alice" };

    const res = decAge(donnees);
    expect(isError(res)).toBe(true);
  });

  it("échoue si le champ existe mais ne respecte pas le décodeur cible", () => {
    const decAge = decodeProp("age", decodeNumber);
    const donnees = { age: "trente" };

    const res = decAge(donnees);
    expect(isError(res)).toBe(true);
  });

  it("échoue de façon sûre si la donnée d'entrée n'est pas un objet (null, primitif)", () => {
    const decNom = decodeProp("nom", decodeString);

    expect(isError(decNom(null))).toBe(true);
    expect(isError(decNom(undefined))).toBe(true);
    expect(isError(decNom("chaîne brute"))).toBe(true);
    expect(isError(decNom(123))).toBe(true);
  });
});

describe("Combinateur decodeTableau", () => {
  it("décode un tableau d'éléments valides", () => {
    const decNombres = decodeTableau(decodeNumber);
    expect(decNombres([1, 2, 3])).toEqual(value([1, 2, 3]));
  });

  it("décode un tableau vide avec succès", () => {
    const decChaines = decodeTableau(decodeString);
    expect(decChaines([])).toEqual(value([]));
  });

  it("échoue si au moins un élément du tableau est invalide", () => {
    const decNombres = decodeTableau(decodeNumber);
    expect(isError(decNombres([1, "deux", 3]))).toBe(true);
  });

  it("échoue si la donnée d'entrée n'est pas un tableau", () => {
    const decNombres = decodeTableau(decodeNumber);
    expect(isError(decNombres({ 0: 1, 1: 2 }))).toBe(true);
    expect(isError(decNombres("123"))).toBe(true);
    expect(isError(decNombres(null))).toBe(true);
    expect(isError(decNombres(undefined))).toBe(true);
  });
});

describe("Combinateur combiner", () => {
  interface Profil {
    readonly id: number;
    readonly nom: string;
  }

  const decodeurProfil: Decodeur<Profil> = combiner(
    decodeProp("id", decodeNumber),
    decodeProp("nom", decodeString),
    (id, nom) => ({
      id,
      nom,
    }),
  );

  it("combine deux champs et construit l'objet cible en cas de succès", () => {
    const json = { id: 101, nom: "Alice" };
    expect(decodeurProfil(json)).toEqual(value({ id: 101, nom: "Alice" }));
  });

  it("ignore les champs superflus lors de la construction", () => {
    const json = { id: 102, nom: "Bob", role: "admin", extra: [1, 2, 3] };
    expect(decodeurProfil(json)).toEqual(value({ id: 102, nom: "Bob" }));
  });

  it("échoue et court-circuite si le premier décodeur échoue", () => {
    const espionSecond = vi.fn(decodeString);
    const decTest = combiner(decodeProp("id", decodeNumber), espionSecond, (id, nom) => ({ id, nom }));

    // L'id est invalide : string au lieu de number
    const json = { id: "invalide", nom: "Alice" };
    const res = decTest(json);

    expect(isError(res)).toBe(true);

    // Le second décodeur ne doit même pas être exécuté grâce à flatMap
    expect(espionSecond).not.toHaveBeenCalled();
  });

  it("échoue si le second décodeur échoue alors que le premier est valide", () => {
    const json = { id: 103, nom: 999 }; // id valide, nom invalide
    const res = decodeurProfil(json);

    expect(isError(res)).toBe(true);
  });

  it("permet l'imbrication pour décoder 3 champs (composition naturelle)", () => {
    interface Article {
      readonly id: number;
      readonly nom: string;
      readonly prix: number;
    }

    // combiner d'un combiner pour créer une structure à 3 champs
    const decArticle: Decodeur<Article> = combiner(
      combiner(decodeProp("id", decodeNumber), decodeProp("nom", decodeString), (id, nom) => ({ id, nom })),
      decodeProp("prix", decodeNumber),
      (base, prix) => ({ ...base, prix }),
    );

    const json = { id: 1, nom: "Livre", prix: 19.99 };
    expect(decArticle(json)).toEqual(value({ id: 1, nom: "Livre", prix: 19.99 }));
  });
});
