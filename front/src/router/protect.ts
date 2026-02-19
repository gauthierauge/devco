import { authService } from "../services/authService";

type ProtectionLevel = "public" | "protected" | "auth-only";

const protectedRoutes: Record<string, ProtectionLevel> = {
    "/dashboard": "protected",
    "/csp-reports": "protected",
    "/login": "auth-only",
    "/register": "auth-only",
};

export const checkRouteAccess = (pathname: string): string | null => {
    const level = protectedRoutes[pathname] || "public";
    const isLogged = authService.isLoggedIn();

    if (!level) return null;

    if (level === "protected" && !isLogged) {
        return "/login";
    }

    if (level === "auth-only" && isLogged) {
        return "/dashboard";
    }

    return null;
};