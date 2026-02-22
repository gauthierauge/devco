import type { StatListView } from "@/mappers/stats.presenter";

const StatList = (stats: StatListView[]) => `
  <ul class="stat-list">
    ${stats
      .map(
        (stat) => `
      <li class="stat-item">
        <div class="stat-row">
          <span class="stat-name">${stat.displayName}</span>
          <span class="stat-count">${stat.compte}</span>
        </div>
        <div class="stat-bar">
          <span style="width: ${stat.percent}%"></span>
        </div>
      </li>
    `
      )
      .join("")}
  </ul>
`;

export { StatList };
