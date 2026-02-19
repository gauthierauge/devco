import { authService } from "../services/authService";

const Navbar = () => {
  const user = authService.getCurrentUser();

  const authLinks = user
    ? `
      <a href="/dashboard" data-link>Dashboard</a>
      <button id="logout-navbar-btn" class="btn btn-outline" style="padding: 0.4em 0.8em; font-size: 0.875em;">
        Déconnexion
      </button>
    `
    : `
      <a href="/login" data-link>Connexion</a>
      <a href="/register" data-link>Inscription</a>
    `;

  const navHtml = `
    <nav class="navbar">
      <div class="brand"><a href="/" data-link>Maison Déco</a></div>
      <div class="nav-links">
        <a href="/" data-link>Produits</a>
        ${authLinks}
      </div>
    </nav>
  `;

  // Créer un wrapper pour gérer les événements
  const mountLogout = () => {
    const logoutBtn = document.querySelector("#logout-navbar-btn") as HTMLButtonElement | null;
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        try {
          await authService.logout();
          window.history.pushState({}, "", "/login");
          window.dispatchEvent(new PopStateEvent("popstate"));
        } catch (error) {
          console.error("Logout error:", error);
        }
      });
    }
  };

  return { html: navHtml, mount: mountLogout };
};

export { Navbar };
