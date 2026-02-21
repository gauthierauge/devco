import { authService } from "@/services/authService";
import { registerSchema, type RegisterFormData } from "@/utils/passwordValidator";
import { z } from "zod";

const renderRegister = () => `
    <div class="page">
        <div class="auth-container">
        <div class="auth-card">
            <h1>Inscription</h1>
            <p class="auth-subtitle">Créez votre compte</p>
            
            <form id="register-form" class="form">
            <label>
                Email
                <input name="email" type="email" placeholder="vous@exemple.com" autocomplete="email" required />
            </label>
            <label>
                Mot de passe
                <input name="password" type="password" placeholder="••••••••" autocomplete="new-password" minlength="15" required />
            </label>
            <label>
                Confirmer le mot de passe
                <input name="confirm-password" type="password" placeholder="••••••••" autocomplete="new-password" minlength="15" required />
            </label>
            
            <small>Le mot de passe doit contenir au minimum 15 caractères (majuscule, minuscule, chiffre et caractère spécial).</small>
            
            <button class="btn" type="submit">S'inscrire</button>
            </form>

            <p class="auth-link">
            Déjà inscrit ? <a href="/login" data-link>Se connecter</a>
            </p>

            <div id="error-message" class="error-message" style="display: none;"></div>
        </div>
        </div>
    </div>
`;

const Register = () => {
    const mount = async () => {
        const container = document.getElementById("view");
        if (!container) return;

        const form = container.querySelector("#register-form") as HTMLFormElement | null;
        const errorDiv = container.querySelector("#error-message") as HTMLDivElement | null;

        form?.addEventListener("submit", async (event) => {
            event.preventDefault();

            try {
                const data = new FormData(form);
                const email = String(data.get("email") || "");
                const password = String(data.get("password") || "");
                const confirmPassword = String(data.get("confirm-password") || "");

                const validatedData: RegisterFormData = registerSchema.parse({
                    email,
                    password,
                    confirmPassword,
                });

                await authService.register(validatedData.email, validatedData.password);

                form.reset();

                window.history.pushState({}, "", "/dashboard");
                window.dispatchEvent(new PopStateEvent("popstate"));
            } catch (error) {

                let message = "Une erreur est survenue lors de l'inscription";

                if (error instanceof z.ZodError) {
                    message = error.issues[0]?.message || message;
                } else if (error instanceof Error) {
                    message = error.message;
                }

                if (errorDiv) {
                    errorDiv.textContent = message;
                    errorDiv.style.display = "block";
                }
                console.error("Register error:", error);
            }
        });
    };

    return { html: renderRegister(), mount };
};

export { Register };
