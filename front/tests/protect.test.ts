jest.mock("@/config/env", () => ({ API_URL: "http://test:5000" }));
jest.mock("../src/services/authService", () => ({
    authService: {
        isLoggedIn: jest.fn(),
    },
}));

import { checkRouteAccess } from "../src/router/protect";
import { authService } from "../src/services/authService";

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

    it("redirige vers /dashboard si route auth-only et connecté", () => {
        mockIsLoggedIn.mockReturnValue(true);
        expect(checkRouteAccess("/login")).toBe("/dashboard");
        expect(checkRouteAccess("/register")).toBe("/dashboard");
    });

    it("retourne null si route protégée et connecté", () => {
        mockIsLoggedIn.mockReturnValue(true);
        expect(checkRouteAccess("/dashboard")).toBeNull();
        expect(checkRouteAccess("/csp-reports")).toBeNull();
    });
});
