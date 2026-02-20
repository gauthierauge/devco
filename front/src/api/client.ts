import { BASE_URL } from "../constants/api.constant";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

type RequestOptions = {
  method?: HttpMethod;
  body?: BodyInit | null;
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
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

  const credentials = options.credentials ?? "include";

  if (method !== "GET" && credentials !== "omit") {
    headers["x-csrf-token"] = await fetchCsrfToken();
  }

  const res = await fetch(url, {
    method,
    body: options.body ?? null,
    headers,
    credentials,
  });

  if (!res.ok) {
    const status = res.status;
    let message = `Erreur ${status}`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
    }
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;

  return (await res.json()) as T;
};

export { request };
