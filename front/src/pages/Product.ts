import { getProduct } from "../api/productApi";
import { API_URL } from "../config/env";
import { toView } from "../services/productService";
import { cartService } from "../services/cartService";
import { authService } from "../services/authService";

const renderProduct = (product: Awaited<ReturnType<typeof getProduct>>) => {
  const view = toView(product);
  const images = view.images
    .map((src) => {
      const resolved = src.startsWith("/") ? `${API_URL}${src}` : src;
      return `<img src="${resolved}" alt="${view.label}" />`;
    })
    .join("");

  const isLoggedIn = authService.isLoggedIn();
  const cartButton = !isLoggedIn
    ? `<button class="btn" id="add-to-cart-btn" data-product-id="${product.id}">Ajouter au panier</button>`
    : "";

  return `
      <div class="page">
        <button class="btn btn-outline" data-action="back">Retour</button>
        <div class="product-detail">
          <div class="product-gallery">${images}</div>
          <div class="product-info">
            <h1>${view.label}</h1>
            <p class="product-category">${view.category}</p>
            <p class="product-price">${view.formattedPrice}</p>
            <p>${view.description}</p>
            <div class="product-actions">
              ${cartButton}
            </div>
          </div>
        </div>
      </div>
    `;
};

const Product = (id: string) => {
  const mount = async () => {
    const container = document.getElementById("view");
    if (!container) return;
    const product = await getProduct(id);
    container.innerHTML = renderProduct(product);

    container.querySelector("[data-action='back']")?.addEventListener("click", () => {
      window.history.pushState({}, "", "/");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    const addToCartBtn = container.querySelector("#add-to-cart-btn") as HTMLButtonElement | null;
    if (addToCartBtn) {
      addToCartBtn.addEventListener("click", () => {
        cartService.addItem(product.id, 1);
        addToCartBtn.textContent = "✓ Ajouté au panier";
        addToCartBtn.disabled = true;

        setTimeout(() => {
          addToCartBtn.textContent = "Ajouter au panier";
          addToCartBtn.disabled = false;
        }, 2000);
      });
    }
  };

  return { html: "<div class='page'>Chargement...</div>", mount };
};

export { Product };
