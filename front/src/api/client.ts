import { BASE_URL } from "../constants/api.constant";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

type RequestOptions = {
  method?: HttpMethod;
  body?: BodyInit | null;
  headers?: Record<string, string>;
};

const fetchCsrfToken = async (): Promise<string> => {
  const res = await fetch(`${BASE_URL}/csrf-token`, {
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to fetch CSRF token");

  const data = await res.json();
  return data.csrfToken;
};

const request = async <T>(url: string, options: RequestOptions = {}): Promise<T> => {
  const method = options.method ?? "GET";
  const headers: Record<string, string> = { ...options.headers };

  // Récupérer un nouveau token CSRF pour chaque requête POST/PUT/DELETE
  if (method !== "GET") {
    const token = await fetchCsrfToken();
    headers["x-csrf-token"] = token;
  }

  const res = await fetch(url, {
    method,
    body: options.body ?? null,
    headers,
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;

  return (await res.json()) as T;
};

export { request };
