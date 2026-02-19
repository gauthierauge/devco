type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

type RequestOptions = {
  method?: HttpMethod;
  body?: BodyInit | null;
  headers?: Record<string, string>;
};

const request = async <T>(url: string, options: RequestOptions = {}): Promise<T> => {
  const res = await fetch(url, {
    method: options.method ?? "GET",
    body: options.body ?? null,
    headers: options.headers,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }

  return (await res.json()) as T;
};

export { request };
