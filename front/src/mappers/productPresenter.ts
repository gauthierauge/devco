import { API_URL } from "../config/env";
import type { ProductView } from "../services/productService";

type ProductCardView = ProductView & {
  imageUrl: string;
};

const resolveImageUrl = (src: string) =>
  src.startsWith("/") ? `${API_URL}${src}` : src;

const toProductCardView = (product: ProductView): ProductCardView => ({
  ...product,
  imageUrl: resolveImageUrl(product.images[0] ?? ""),
});

export { toProductCardView };
export type { ProductCardView };
