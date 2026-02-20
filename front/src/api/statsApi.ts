import { BASE_URL } from "../constants/api.constant";
import { request } from "./client";

export type StatDto = {
  nom: string;
  compte: number;
};

const listStats = () => request<StatDto[]>(`${BASE_URL}/stats`, { credentials: "omit" });

export { listStats };
