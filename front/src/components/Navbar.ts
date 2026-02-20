import { authService } from "../services/authService";
import { cartService } from "../services/cartService";

const Navbar = () => {
  const user = authService.getCurrentUser();
  const cartCount = cartService.getCount();

  const cartLink = `
    <a href="/cart" data-link class="nav-cart">
      Panier
      ${cartCount > 0 ? `<span class="nav-cart-badge">${cartCount}</span>` : ""}
    </a>
  `;

  const userLinks = user
    ? `
      <span class="nav-separator"></span>
      <a href="/csp-reports" data-link>CSP Reports</a>
      <a href="/dashboard" data-link>Dashboard</a>
      ${cartLink}
      <span class="nav-separator"></span>
      <a href="#" id="logout-navbar-btn" class="nav-logout">Déconnexion</a>
    `
    : `
      <span class="nav-separator"></span>
      ${cartLink}
      <a href="/login" data-link>Connexion</a>
      <a href="/register" data-link>Inscription</a>
    `;

  const navHtml = `
    <nav class="navbar">
      <div class="brand"><a href="/" data-link>Maison Déco</a></div>
      <div class="nav-links">
        <a href="/" data-link>Produits</a>
        <a href="/stats" data-link>Statistiques</a>
        ${userLinks}
      </div>
    </nav>
  `;

  const mount = () => {
    const logoutBtn = document.querySelector("#logout-navbar-btn") as HTMLAnchorElement | null;
    logoutBtn?.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        await authService.logout();
        window.history.pushState({}, "", "/login");
        window.dispatchEvent(new PopStateEvent("popstate"));
      } catch (error) {
        console.error("Logout error:", error);
      }
    });
  };

  return { html: navHtml, mount };
};

export { Navbar };
