import { BASE_URL } from "../constants/api.constant";
import { request } from "./client";

export type CspReportDto = {
  id: number;
  payload: Record<string, string>;
  createdAt: string;
};

const listCspReports = () =>
  request<CspReportDto[]>(`${BASE_URL}/csp-reports`);

export { listCspReports };
