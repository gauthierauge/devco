import { presentCspReportRow, presentCspReportTable } from "../src/mappers/cspReportPresenter";
import type { CspReportView } from "../src/services/cspReportService";

const makeReport = (overrides: Partial<CspReportView> = {}): CspReportView => ({
    id: 1,
    violatedDirective: "script-src",
    documentUri: "https://example.com",
    blockedUri: "https://evil.com",
    date: "15/06/2024 12:30:00",
    ...overrides,
});

describe("presentCspReportRow", () => {
    it("retourne un <tr> HTML avec les bonnes valeurs", () => {
        const report = makeReport();
        const html = presentCspReportRow(report);
        expect(html).toContain("<tr>");
        expect(html).toContain("</tr>");
        expect(html).toContain("<td>script-src</td>");
        expect(html).toContain("<td>https://example.com</td>");
        expect(html).toContain("<td>https://evil.com</td>");
        expect(html).toContain("<td>15/06/2024 12:30:00</td>");
    });
});

describe("presentCspReportTable", () => {
    it("retourne <p>Aucun rapport CSP.</p> si tableau vide", () => {
        const html = presentCspReportTable([]);
        expect(html).toBe("<p>Aucun rapport CSP.</p>");
    });

    it("retourne une <table> complète avec les lignes", () => {
        const reports = [makeReport(), makeReport({ id: 2, violatedDirective: "style-src" })];
        const html = presentCspReportTable(reports);
        expect(html).toContain("<table");
        expect(html).toContain("<thead>");
        expect(html).toContain("<tbody>");
        expect(html).toContain("script-src");
        expect(html).toContain("style-src");
        expect(html).toContain("Directive violée");
    });
});
