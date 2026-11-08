import { describe, it, expect } from "vitest";
import { isError } from "../src/libs/result.js";
import { mockContexteHttp } from "../src/mock-contexte-http.js";
import { scenarioCommandesPremierProfil, scenarioCreerCommande, scenarioConsulterCommande } from "../src/scenarios.js";

describe("Validation des Scénarios TP4 avec bouchon HTTP", () => {
  describe("Scénario 1 : scenarioConsulterCommande", () => {
    it("récupère les détails exacts d'une commande existante (/commandes/CMD-2)", () => {
      const res = scenarioConsulterCommande(mockContexteHttp, "CMD-2");

      expect(isError(res)).toBe(false);
      if (!isError(res)) {
        expect(res.value).toEqual({
          id: "CMD-2",
          profilId: "1",
          description: "Clavier mécanique",
          montant: 120.0,
        });
      }
    });

    it("renvoie une erreur 404 lors de la recherche d'une commande inexistante", () => {
      const res = scenarioConsulterCommande(mockContexteHttp, "CMD-INCONNUE");

      expect(isError(res)).toBe(true);
      if (isError(res)) {
        const err = res.error;
        expect("code" in err && err.code === "ErreurClient").toBe(true);
        if ("code" in err && err.code === "ErreurClient") {
          expect(err.statut).toBe(404);
        }
      }
    });
  });

  describe("Scénario 2 : scenarioCreerCommande", () => {
    it("crée une nouvelle commande avec succès (201 Created) pour un profil existant", () => {
      const res = scenarioCreerCommande(mockContexteHttp, "1", "Casque antibruit", 199.99);

      expect(isError(res)).toBe(false);
      if (!isError(res)) {
        expect(res.value.description).toBe("Casque antibruit");
        expect(res.value.montant).toBe(199.99);
        expect(res.value.id).toMatch(/^CMD-/);
      }
    });

    it("échoue avec une erreur 404 si le profil cible n'existe pas", () => {
      const res = scenarioCreerCommande(mockContexteHttp, "999", "Commande orpheline", 50.0);

      expect(isError(res)).toBe(true);
      if (isError(res)) {
        const err = res.error;
        expect("code" in err && err.code === "ErreurClient").toBe(true);
        if ("code" in err && err.code === "ErreurClient") {
          expect(err.statut).toBe(404);
        }
      }
    });
  });

  describe("Scénario 3 : scenarioCommandesPremierProfil", () => {
    it("récupère les profils puis enchaîne sur les commandes du premier (Alice - id: 1)", () => {
      const res = scenarioCommandesPremierProfil(mockContexteHttp);

      expect(isError(res)).toBe(false);
      if (!isError(res)) {
        expect(res.value).toHaveLength(2);
        expect(res.value[0].description).toBe("Livre TypeScript");
        expect(res.value[1].description).toBe("Clavier mécanique");
      }
    });
  });
});
