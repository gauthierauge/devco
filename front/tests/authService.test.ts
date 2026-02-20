jest.mock("@/config/env", () => ({ API_URL: "http://test:5000" }));
jest.mock("@/api/authApi", () => ({
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    getCurrentUser: jest.fn(),
}));

import { authService } from "@/services/authService";
import { register as registerApi, login as loginApi, logout as logoutApi, getCurrentUser as getCurrentUserApi } from "@/api/authApi";
import { AUTH_STORAGE_KEY } from "@/constants/auth.constant";

const mockRegister = jest.mocked(registerApi);
const mockLogin = jest.mocked(loginApi);
const mockLogout = jest.mocked(logoutApi);
const mockGetCurrentUser = jest.mocked(getCurrentUserApi);

const fakeUser = { id: "1", email: "a@b.com", createdAt: "2024-01-01" };

describe("authService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    describe("register", () => {
        it("appelle registerApi et stocke l'utilisateur dans localStorage", async () => {
            mockRegister.mockResolvedValueOnce(fakeUser);

            const result = await authService.register("a@b.com", "pass123");

            expect(mockRegister).toHaveBeenCalledWith("a@b.com", "pass123");
            expect(result).toEqual(fakeUser);
            expect(JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY)!)).toEqual(fakeUser);
        });
    });

    describe("login", () => {
        it("appelle loginApi et stocke l'utilisateur dans localStorage", async () => {
            mockLogin.mockResolvedValueOnce(fakeUser);

            const result = await authService.login("a@b.com", "pass123");

            expect(mockLogin).toHaveBeenCalledWith("a@b.com", "pass123");
            expect(result).toEqual(fakeUser);
            expect(JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY)!)).toEqual(fakeUser);
        });
    });

    describe("logout", () => {
        it("appelle logoutApi et supprime l'utilisateur de localStorage", async () => {
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(fakeUser));
            mockLogout.mockResolvedValueOnce(undefined);

            await authService.logout();

            expect(mockLogout).toHaveBeenCalled();
            expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
        });
    });

    describe("isLoggedIn", () => {
        it("retourne true si utilisateur stocké", () => {
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(fakeUser));
            expect(authService.isLoggedIn()).toBe(true);
        });

        it("retourne false sinon", () => {
            expect(authService.isLoggedIn()).toBe(false);
        });
    });

    describe("getCurrentUser", () => {
        it("retourne l'utilisateur depuis localStorage", () => {
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(fakeUser));
            expect(authService.getCurrentUser()).toEqual(fakeUser);
        });

        it("retourne null si rien stocké", () => {
            expect(authService.getCurrentUser()).toBeNull();
        });
    });

    describe("validateSession", () => {
        it("stocke l'utilisateur si l'API retourne un user", async () => {
            mockGetCurrentUser.mockResolvedValueOnce(fakeUser);

            const result = await authService.validateSession();

            expect(result).toEqual(fakeUser);
            expect(JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY)!)).toEqual(fakeUser);
        });

        it("clear si l'API ne retourne pas de user", async () => {
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(fakeUser));
            mockGetCurrentUser.mockResolvedValueOnce(null);

            const result = await authService.validateSession();

            expect(result).toBeNull();
            expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
        });
    });
});
