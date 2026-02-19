import { BASE_URL } from "../constants/api.constant";
import { request } from "./client";

export type ProductDto = {
  id: string;
  label: string;
  description: string;
  images: string[];
  price: number;
  category: string;
  createdAt: string;
  updatedAt: string;
};

const baseUrl = `${BASE_URL}/products`;

const listProducts = (query?: { q?: string; category?: string }) => {
  const params = new URLSearchParams();
  if (query?.q) params.set("q", query.q);
  if (query?.category) params.set("category", query.category);
  const suffix = params.toString() ? `?${params.toString()}` : "";
  return request<ProductDto[]>(`${baseUrl}${suffix}`);
};

const getProduct = (id: string) => request<ProductDto>(`${baseUrl}/${id}`);

const createProduct = (payload: {
  label: string;
  description: string;
  category: string;
  price: number;
  images: File[];
}) => {
  const form = new FormData();
  form.append("label", payload.label);
  form.append("description", payload.description);
  form.append("category", payload.category);
  form.append("price", String(payload.price));
  payload.images.forEach((img) => form.append("images", img));
  return request<ProductDto>(baseUrl, { method: "POST", body: form });
};

const updateProduct = (id: string, payload: {
  label?: string;
  description?: string;
  category?: string;
  price?: number;
  images?: File[];
}) => {
  const form = new FormData();
  if (payload.label) form.append("label", payload.label);
  if (payload.description) form.append("description", payload.description);
  if (payload.category) form.append("category", payload.category);
  if (payload.price !== undefined) form.append("price", String(payload.price));
  payload.images?.forEach((img) => form.append("images", img));
  return request<ProductDto>(`${baseUrl}/${id}`, { method: "PUT", body: form });
};

const deleteProduct = (id: string) => request<void>(`${baseUrl}/${id}`, { method: "DELETE" });

export { listProducts, getProduct, createProduct, updateProduct, deleteProduct };
