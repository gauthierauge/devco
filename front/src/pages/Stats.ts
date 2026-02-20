import { listStats } from "../api/statsApi";
import { StatList } from "../components/StatList";
import { toStatListView } from "../mappers/statsPresenter";
import { totalCount, toView } from "../services/statsService";

type StatsState = {
  stats: Awaited<ReturnType<typeof listStats>>;
  loading: boolean;
  error: string | null;
};

const initialState: StatsState = {
  stats: [],
  loading: true,
  error: null,
};

const setState = (state: StatsState, patch: Partial<StatsState>): StatsState => ({
  ...state,
  ...patch,
});

const renderStats = (state: StatsState) => {
  if (state.loading) {
    return `<p>Chargement des statistiques…</p>`;
  }
  if (state.error) {
    return `<p class="stat-error">${state.error}</p>`;
  }
  if (state.stats.length === 0) {
    return `<p>Aucune statistique disponible.</p>`;
  }

  const view = toView(state.stats);
  const total = totalCount(state.stats);
  return `
    <div class="stat-summary">
      <div>
        <p class="stat-label">Produits enregistrés</p>
        <p class="stat-total">${total}</p>
      </div>
      <div class="stat-badge">${state.stats.length} catégorie(s)</div>
    </div>
    ${StatList(view.map(toStatListView))}
  `;
};

const renderPage = (state: StatsState) => `
  <div class="page">
    <header class="page-header">
      <h1>Statistiques</h1>
      <p>Répartition des produits par catégorie.</p>
    </header>
    <section class="panel stat-panel">
      ${renderStats(state)}
    </section>
  </div>
`;

const Stats = () => {
  let state = initialState;

  const repaint = () => {
    const container = document.getElementById("view");
    if (!container) return;
    container.innerHTML = renderPage(state);
  };

  const load = async () => {
    try {
      const stats = await listStats();
      state = setState(state, { stats, loading: false });
    } catch (error) {
      state = setState(state, {
        loading: false,
        error: error instanceof Error ? error.message : "Erreur lors du chargement",
      });
    }
    repaint();
  };

  const mount = async () => {
    repaint();
    await load();
  };

  return { html: renderPage(state), mount };
};

export { Stats };
