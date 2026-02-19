import { API_URL } from "../config/env";
import type { ProductView } from "../services/productService";

const resolveImageUrl = (src: string) =>
  src.startsWith("/") ? `${API_URL}${src}` : src;

const presentProductCard = (product: ProductView) => `
  <article class="product-card">
    <img src="${resolveImageUrl(product.images[0] ?? "")}" alt="${product.label}" class="product-image" />
    <div class="product-body">
      <h3>${product.label}</h3>
      <p class="product-category">${product.category}</p>
      <p class="product-price">${product.formattedPrice}</p>
      <div class="product-actions">
        <button class="btn" data-action="view" data-id="${product.id}">Voir</button>
        <button class="btn btn-outline" data-action="edit" data-id="${product.id}">Modifier</button>
        <button class="btn btn-danger" data-action="delete" data-id="${product.id}">Supprimer</button>
      </div>
    </div>
  </article>
`;

export { presentProductCard };
