import type { StatView } from "@/services/stats.service";

type StatListView = StatView & {
  displayName: string;
};

const toStatListView = (stat: StatView): StatListView => ({
  ...stat,
  displayName: stat.nom || "Sans catégorie",
});

export { toStatListView };
export type { StatListView };
