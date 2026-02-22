import type { ProductDto } from "@/api/product.api";

type ProductView = ProductDto & { formattedPrice: string };

const formatPrice = (value: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value);

const toView = (product: ProductDto): ProductView => ({
  ...product,
  formattedPrice: formatPrice(product.price),
});

const filterProducts = (products: ProductDto[], query: string) => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return products;
  return products.filter((product) =>
    [product.label, product.description, product.category]
      .join(" ")
      .toLowerCase()
      .includes(normalized)
  );
};

export { formatPrice, toView, filterProducts };
export type { ProductView };
