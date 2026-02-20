import { authService } from "../services/authService";

const renderDashboard = (user: { id: string; email: string }) => `
    <div class="page">
        <header class="page-header">
            <h1>Tableau de bord</h1>
            <p>Bienvenue, ${user.email}</p>
        </header>
        
        <div class="dashboard-container">
            <div class="dashboard-card">
                <h2>Informations du compte</h2>
                <dl>
                    <dt>Bonjour, vous êtes bien sur la page Dashboard. Terminé.</dt>
                </dl>
                <button class="btn btn-outline" id="logout-btn">Se déconnecter</button>
            </div>
        </div>
    </div>
    `;

const renderUnauthorized = () => `
    <div class="page">
        <div class="auth-container">
        <div class="auth-card error-card">
            <h1>Accès refusé</h1>
            <p>Vous devez être connecté pour accéder à cette page.</p>
            <div class="form-actions">
            <a href="/login" data-link class="btn">Se connecter</a>
            <a href="/register" data-link class="btn btn-outline">S'inscrire</a>
            </div>
        </div>
        </div>
    </div>
`;

const Dashboard = () => {
    const mount = async () => {
        const container = document.getElementById("view");
        if (!container) return;

        const user = authService.getCurrentUser();

        if (!user) {
            container.innerHTML = renderUnauthorized();

            const links = container.querySelectorAll("[data-link]");
            links.forEach((link) => {
                (link as HTMLAnchorElement).addEventListener("click", (e) => {
                    e.preventDefault();
                    window.history.pushState({}, "", (e.target as HTMLAnchorElement).href);
                    window.dispatchEvent(new PopStateEvent("popstate"));
                });
            });
            return;
        }

        try {
            const refreshedUser = await authService.validateSession();
            if (!refreshedUser) {
                window.history.pushState({}, "", "/login");
                window.dispatchEvent(new PopStateEvent("popstate"));
                return;
            }
        } catch (error) {

        }

        const renderedUser = authService.getCurrentUser();
        if (!renderedUser) return;

        container.innerHTML = renderDashboard({
            id: String(renderedUser.id || ""),
            email: renderedUser.email || "",
        });

        container.querySelector("#logout-btn")?.addEventListener("click", async () => {
            try {
                await authService.logout();
                window.history.pushState({}, "", "/login");
                window.dispatchEvent(new PopStateEvent("popstate"));
            } catch (error) {

            }
        });

        const links = container.querySelectorAll("[data-link]");
        links.forEach((link) => {
            (link as HTMLAnchorElement).addEventListener("click", (e) => {
                e.preventDefault();
                window.history.pushState({}, "", (e.target as HTMLAnchorElement).href);
                window.dispatchEvent(new PopStateEvent("popstate"));
            });
        });
    };

    return { html: "<div class='page'>Chargement...</div>", mount };
};

export { Dashboard };
