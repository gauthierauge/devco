import type { StatDto } from "@/api/statsApi";

type StatView = StatDto & {
  percent: number;
};

const totalCount = (stats: StatDto[]) =>
  stats.reduce((sum, stat) => sum + stat.compte, 0);

const toView = (stats: StatDto[]): StatView[] => {
  const total = totalCount(stats);
  if (total === 0) {
    return stats.map((stat) => ({ ...stat, percent: 0 }));
  }
  return stats.map((stat) => ({
    ...stat,
    percent: Math.round((stat.compte / total) * 100),
  }));
};

export { totalCount, toView };
export type { StatView };
