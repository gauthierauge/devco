jest.mock("@/config/env", () => ({ API_URL: "http://test:5000" }));
jest.mock("@/services/auth.service", () => ({
    authService: {
        isLoggedIn: jest.fn(),
    },
}));

import { checkRouteAccess } from "@/router/protect";
import { authService } from "@/services/auth.service";

const mockIsLoggedIn = jest.mocked(authService.isLoggedIn);

describe("checkRouteAccess", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("retourne null pour les routes publiques", () => {
        mockIsLoggedIn.mockReturnValue(false);
        expect(checkRouteAccess("/")).toBeNull();
        expect(checkRouteAccess("/stats")).toBeNull();
        expect(checkRouteAccess("/unknown")).toBeNull();
    });

    it("redirige vers /login si route protégée et non connecté", () => {
        mockIsLoggedIn.mockReturnValue(false);
        expect(checkRouteAccess("/dashboard")).toBe("/login");
        expect(checkRouteAccess("/csp-reports")).toBe("/login");
    });

    it("redirige vers / si route auth-only et connecté", () => {
        mockIsLoggedIn.mockReturnValue(true);
        expect(checkRouteAccess("/login")).toBe("/");
        expect(checkRouteAccess("/register")).toBe("/");
    });

    it("retourne null si route protégée et connecté", () => {
        mockIsLoggedIn.mockReturnValue(true);
        expect(checkRouteAccess("/dashboard")).toBeNull();
        expect(checkRouteAccess("/csp-reports")).toBeNull();
    });
});
