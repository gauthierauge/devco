import { toStatListView } from "../src/mappers/statsPresenter";
import type { StatView } from "../src/services/statsService";

describe("toStatListView", () => {
    it("ajoute displayName = nom de la catégorie", () => {
        const stat: StatView = { nom: "Mobilier", compte: 10, percent: 50 };
        const view = toStatListView(stat);
        expect(view.displayName).toBe("Mobilier");
        expect(view.nom).toBe("Mobilier");
        expect(view.percent).toBe(50);
    });

    it('retourne "Sans catégorie" si nom vide', () => {
        const stat: StatView = { nom: "", compte: 5, percent: 25 };
        const view = toStatListView(stat);
        expect(view.displayName).toBe("Sans catégorie");
    });
});
