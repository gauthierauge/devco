import type { StatView } from "../services/statsService";

const presentStatItem = (stat: StatView) => `
  <li class="stat-item">
    <div class="stat-row">
      <span class="stat-name">${stat.nom || "Sans catégorie"}</span>
      <span class="stat-count">${stat.compte}</span>
    </div>
    <div class="stat-bar">
      <span style="width: ${stat.percent}%"></span>
    </div>
  </li>
`;

const presentStatList = (stats: StatView[]) => `
  <ul class="stat-list">
    ${stats.map(presentStatItem).join("")}
  </ul>
`;

export { presentStatList };
