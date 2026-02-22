import { toView } from "@/services/cspReport.service";
import type { CspReportDto } from "@/api/cspReport.api";

describe("cspReportService toView", () => {
    it("mappe les champs violated-directive, document-uri, blocked-uri", () => {
        const dto: CspReportDto = {
            id: 1,
            payload: {
                "violated-directive": "script-src",
                "document-uri": "https://example.com",
                "blocked-uri": "https://evil.com",
            },
            createdAt: "2024-06-15T10:30:00.000Z",
        };
        const view = toView(dto);
        expect(view.id).toBe(1);
        expect(view.violatedDirective).toBe("script-src");
        expect(view.documentUri).toBe("https://example.com");
        expect(view.blockedUri).toBe("https://evil.com");
    });

    it('retourne "" pour les champs manquants', () => {
        const dto: CspReportDto = {
            id: 2,
            payload: {},
            createdAt: "2024-06-15T10:30:00.000Z",
        };
        const view = toView(dto);
        expect(view.violatedDirective).toBe("");
        expect(view.documentUri).toBe("");
        expect(view.blockedUri).toBe("");
    });

    it("formate la date en fr-FR", () => {
        const dto: CspReportDto = {
            id: 3,
            payload: {},
            createdAt: "2024-06-15T10:30:00.000Z",
        };
        const view = toView(dto);
        expect(view.date).toMatch(/15\/06\/2024/);
    });
});
