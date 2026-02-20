import { authService } from "../services/authService";

const renderLogin = () => `
    <div class="page">
        <div class="auth-container">
        <div class="auth-card">
            <h1>Connexion</h1>
            <p class="auth-subtitle">Connectez-vous à votre compte</p>
            
            <form id="login-form" class="form">
            <label>
                Email
                <input name="email" type="email" placeholder="vous@exemple.com" required />
            </label>
            <label>
                Mot de passe
                <input name="password" type="password" placeholder="••••••••" required />
            </label>
            
            <button class="btn" type="submit">Se connecter</button>
            </form>

            <p class="auth-link">
            Pas encore de compte ? <a href="/register" data-link>S'inscrire</a>
            </p>

            <div id="error-message" class="error-message" style="display: none;"></div>
        </div>
        </div>
    </div>
`;

const Login = () => {
    const mount = async () => {
        const container = document.getElementById("view");
        if (!container) return;

        const form = container.querySelector("#login-form") as HTMLFormElement | null;
        const errorDiv = container.querySelector("#error-message") as HTMLDivElement | null;

        form?.addEventListener("submit", async (event) => {
            event.preventDefault();

            try {
                const data = new FormData(form);
                const email = String(data.get("email") || "");
                const password = String(data.get("password") || "");

                if (!email || !password) {
                    throw new Error("Email et mot de passe obligatoires");
                }

                await authService.login(email, password);

                window.history.pushState({}, "", "/dashboard");
                window.dispatchEvent(new PopStateEvent("popstate"));
            } catch (error) {
                const message = error instanceof Error ? error.message : "Une erreur est survenue lors de la connexion";
                if (errorDiv) {
                    errorDiv.textContent = message;
                    errorDiv.style.display = "block";
                }

            }
        });
    };

    return { html: renderLogin(), mount };
};

export { Login };
