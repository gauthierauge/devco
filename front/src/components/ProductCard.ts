import type { ProductCardView } from "@/mappers/productPresenter";

type ProductCardProps = ProductCardView & {
  canManage: boolean;
};

const ProductCard = (product: ProductCardProps) => `
  <article class="product-card">
    <img src="${product.imageUrl}" alt="${product.label}" class="product-image" />
    <div class="product-body">
      <h3>${product.label}</h3>
      <p class="product-category">${product.category}</p>
      <p class="product-price">${product.formattedPrice}</p>
      <div class="product-actions">
        <button class="btn" data-action="view" data-id="${product.id}">Voir</button>
        <button class="btn" data-action="add-to-cart" data-id="${product.id}" title="Ajouter au panier">+</button>
        ${product.canManage ? `<button class="btn btn-outline" data-action="edit" data-id="${product.id}">Modifier</button>` : ""}
        ${product.canManage ? `<button class="btn btn-danger" data-action="delete" data-id="${product.id}">Supprimer</button>` : ""}
      </div>
    </div>
  </article>
`;

export { ProductCard };
