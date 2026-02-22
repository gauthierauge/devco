import type { CspReportView } from "@/services/cspReport.service";

const presentCspReportRow = (report: CspReportView): string => `
      <tr>
        <td>${report.violatedDirective}</td>
        <td class="csp-uri">${report.documentUri}</td>
        <td class="csp-uri">${report.blockedUri}</td>
        <td class="csp-date">${report.date}</td>
      </tr>`;

const presentCspReportTable = (reports: CspReportView[]): string => {
  if (reports.length === 0) {
    return `<p>Aucun rapport CSP.</p>`;
  }

  const rows = reports.map(presentCspReportRow).join("");

  return `
    <div class="csp-summary">
      <span class="csp-count">${reports.length} violation${reports.length > 1 ? "s" : ""}</span>
    </div>
    <div class="csp-table-wrapper">
      <table class="csp-table">
        <thead>
          <tr>
            <th>Directive violée</th>
            <th>Document URI</th>
            <th>Blocked URI</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
};

export { presentCspReportRow, presentCspReportTable };
