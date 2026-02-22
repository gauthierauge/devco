import { totalCount, toView } from "@/services/stats.service";
import type { StatDto } from "@/api/stats.api";

describe("totalCount", () => {
    it("somme les compte de tous les stats", () => {
        const stats: StatDto[] = [
            { nom: "A", compte: 10 },
            { nom: "B", compte: 20 },
            { nom: "C", compte: 30 },
        ];
        expect(totalCount(stats)).toBe(60);
    });

    it("retourne 0 pour un tableau vide", () => {
        expect(totalCount([])).toBe(0);
    });
});

describe("toView", () => {
    it("calcule les pourcentages arrondis", () => {
        const stats: StatDto[] = [
            { nom: "A", compte: 1 },
            { nom: "B", compte: 2 },
        ];
        const views = toView(stats);
        expect(views[0].percent).toBe(33);
        expect(views[1].percent).toBe(67);
    });

    it("retourne percent=0 si total=0", () => {
        const stats: StatDto[] = [
            { nom: "A", compte: 0 },
            { nom: "B", compte: 0 },
        ];
        const views = toView(stats);
        expect(views[0].percent).toBe(0);
        expect(views[1].percent).toBe(0);
    });
});
