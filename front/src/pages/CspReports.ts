import { listCspReports } from "@/api/cspReportApi";
import { toView, type CspReportView } from "@/services/cspReportService";
import { presentCspReportTable } from "@/mappers/cspReportPresenter";

type CspReportsState = {
  reports: CspReportView[];
  error: string | null;
};

const initialState: CspReportsState = {
  reports: [],
  error: null,
};

const setState = (
  state: CspReportsState,
  patch: Partial<CspReportsState>,
): CspReportsState => ({ ...state, ...patch });

const renderTable = (state: CspReportsState) => {
  if (state.error) {
    return `<p class="error">${state.error}</p>`;
  }

  return presentCspReportTable(state.reports);
};

const renderPage = (state: CspReportsState) => `
  <div class="page">
    <header class="page-header">
      <h1>Rapports CSP</h1>
      <p>Historique des violations Content-Security-Policy.</p>
    </header>
    <section class="panel">
      ${renderTable(state)}
    </section>
  </div>
`;

const CspReports = () => {
  let state = initialState;

  const repaint = () => {
    const container = document.getElementById("view");
    if (!container) return;
    container.innerHTML = renderPage(state);
  };

  const load = async () => {
    try {
      const dtos = await listCspReports();
      state = setState(state, { reports: dtos.map(toView) });
    } catch (err: unknown) {
      const message =
        err instanceof Error &&
        (err.message.includes("401") || err.message.includes("Unauthorized"))
          ? "Non autorisé — veuillez vous connecter."
          : "Erreur lors du chargement des rapports CSP.";
      state = setState(state, { error: message });
    }
    repaint();
  };

  const mount = async () => {
    repaint();
    await load();
  };

  return { html: renderPage(state), mount };
};

export { CspReports };
