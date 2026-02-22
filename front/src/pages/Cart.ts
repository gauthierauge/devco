import { getProduct } from "../api/product.api";
import { API_URL } from "../config/env";
import { cartService } from "../services/cart.service";
import { toView } from "../services/product.service";

const renderEmptyCart = () => `
    <div class="page">
        <header class="page-header">
        <h1>Panier</h1>
        <p>Votre panier est vide</p>
        </header>

        <div class="empty-state">
        <p>Vous n'avez pas encore d'articles dans votre panier.</p>
        <a href="/" data-link class="btn">Continuer vos achats</a>
        </div>
    </div>
`;

const renderCart = async (isLoggedIn: boolean = false) => {
    const items = cartService.getCart();

    const itemsWithProducts = await Promise.all(
        items.map(async (item) => {
            try {
                const product = await getProduct(item.productId);
                return { ...item, product };
            } catch {
                return null;
            }
        })
    );

    const validItems = itemsWithProducts.filter((item) => item !== null);

    if (validItems.length === 0) {
        return renderEmptyCart();
    }

    const cartRows = validItems
        .map((item) => {
            const product = toView(item!.product);
            const subtotal = (Number(product.price) * item!.quantity).toFixed(2);
            const imageUrl = product.images[0]
                ? product.images[0].startsWith("/")
                    ? `${API_URL}${product.images[0]}`
                    : product.images[0]
                : "";

            return `
                <tr>
                <td>
                    ${imageUrl
                    ? `<img src="${imageUrl}" alt="${product.label}" class="cart-item-thumb" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;" />`
                    : `<span style="width: 60px; height: 60px; background: #eee; display: inline-block; border-radius: 4px;"></span>`
                }
                </td>
                <td>
                    <div>
                    <strong>${product.label}</strong>
                    <p style="color: #666; font-size: 0.875em; margin: 4px 0 0 0;">${product.category}</p>
                    </div>
                </td>
                <td style="text-align: right;">${product.formattedPrice}</td>
                <td style="text-align: center;">
                    <div style="display: flex; gap: 4px; align-items: center; justify-content: center;">
                    <button class="qty-btn qty-minus" data-product-id="${item!.productId}" style="padding: 4px 8px; font-size: 0.875em;">−</button>
                    <span class="qty-display" data-product-id="${item!.productId}" style="min-width: 30px; text-align: center;">${item!.quantity}</span>
                    <button class="qty-btn qty-plus" data-product-id="${item!.productId}" style="padding: 4px 8px; font-size: 0.875em;">+</button>
                    </div>
                </td>
                <td style="text-align: right;"><strong>${subtotal}€</strong></td>
                <td style="text-align: center;">
                    <button class="cart-remove-btn" data-product-id="${item!.productId}" style="padding: 4px 8px; background: #f5f5f5; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;">Supprimer</button>
                </td>
                </tr>
            `;
        })
        .join("");

    const total = validItems
        .reduce((sum, item) => sum + Number(toView(item!.product).price) * item!.quantity, 0)
        .toFixed(2);

    const syncInfo = isLoggedIn
        ? `
            <div style="background: #e3f2fd; border: 1px solid #90caf9; border-radius: 4px; padding: 12px; margin-bottom: 1rem;">
            <p style="margin: 0; font-size: 0.875em; color: #1976d2;">
                Panier synchronisé automatiquement avec votre compte
            </p>
            </div>
        `
        : '';

    return `
        <div class="page">
        <header class="page-header">
            <h1>Panier</h1>
            <p>${validItems.length} article${validItems.length > 1 ? "s" : ""}</p>
        </header>

        <div class="cart-container" style="display: grid; grid-template-columns: 1fr 300px; gap: 2rem; margin-top: 2rem;">
            <div class="cart-items">
            <table class="cart-table" style="width: 100%; border-collapse: collapse;">
                <thead>
                <tr style="border-bottom: 2px solid #eee;">
                    <th style="width: 80px; text-align: left; padding: 8px 0;"></th>
                    <th style="text-align: left; padding: 8px;">Produit</th>
                    <th style="text-align: right; padding: 8px;">Prix</th>
                    <th style="text-align: center; padding: 8px;">Quantité</th>
                    <th style="text-align: right; padding: 8px;">Sous-total</th>
                    <th style="text-align: center; padding: 8px;"></th>
                </tr>
                </thead>
                <tbody>
                ${cartRows}
                </tbody>
            </table>
            </div>

            <div class="cart-summary" style="background: #f9f9f9; padding: 1.5rem; border-radius: 8px; height: fit-content; border: 1px solid #eee;">
            ${syncInfo}
            <h3>Résumé</h3>
            <div style="margin: 1.5rem 0; padding: 1rem 0; border-top: 1px solid #eee; border-bottom: 1px solid #eee;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>Sous-total</span>
                <strong>${total}€</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>Livraison</span>
                <strong>À calculer</strong>
                </div>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 1rem 0; font-size: 1.125em;">
                <strong>Total</strong>
                <strong>${total}€</strong>
            </div>
            <button class="btn" style="width: 100%; margin-bottom: 8px;">Procéder au paiement</button>
            <a href="/" data-link class="btn btn-outline" style="display: block; text-align: center; text-decoration: none;">Continuer vos achats</a>
            </div>
        </div>
        </div>
    `;
};

const Cart = () => {
    const mount = async () => {
        const container = document.getElementById("view");
        if (!container) return;

        const { authService } = await import("@/services/auth.service");
        const isLoggedIn = authService.isLoggedIn();

        // Afficher le panier
        const html = await renderCart(isLoggedIn);
        container.innerHTML = html;

        mountCartActions();
    };

    return {
        html: '<div id="view"></div>',
        mount,
    };
};

const mountCartActions = () => {
    document.querySelectorAll(".qty-plus").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            const productId = (btn as HTMLButtonElement).dataset.productId;
            if (productId) {
                const items = cartService.getCart();
                const item = items.find((i) => i.productId === productId);
                if (item) {
                    cartService.updateQuantity(productId, item.quantity + 1);
                    reloadCart();
                }
            }
        });
    });

    document.querySelectorAll(".qty-minus").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            const productId = (btn as HTMLButtonElement).dataset.productId;
            if (productId) {
                const items = cartService.getCart();
                const item = items.find((i) => i.productId === productId);
                if (item && item.quantity > 1) {
                    cartService.updateQuantity(productId, item.quantity - 1);
                    reloadCart();
                }
            }
        });
    });

    document.querySelectorAll(".cart-remove-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            const productId = (btn as HTMLButtonElement).dataset.productId;
            if (productId) {
                cartService.removeItem(productId);
                reloadCart();
            }
        });
    });
};

const reloadCart = () => {
    const cart = Cart();
    const container = document.getElementById("view");
    if (container) {
        cart.mount();
    }
};

export { Cart };
