import type { CspReportView } from "../services/cspReportService";

const presentCspReportRow = (report: CspReportView): string => `
      <tr>
        <td>${report.violatedDirective}</td>
        <td>${report.documentUri}</td>
        <td>${report.blockedUri}</td>
        <td>${report.date}</td>
      </tr>`;

const presentCspReportTable = (reports: CspReportView[]): string => {
  if (reports.length === 0) {
    return `<p>Aucun rapport CSP.</p>`;
  }

  const rows = reports.map(presentCspReportRow).join("");

  return `
    <table class="table">
      <thead>
        <tr>
          <th>Directive violée</th>
          <th>Document URI</th>
          <th>Blocked URI</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
};

export { presentCspReportRow, presentCspReportTable };
