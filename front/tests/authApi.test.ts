jest.mock("@/config/env", () => ({ API_URL: "http://test:5000" }));
jest.mock("../src/api/client", () => ({ request: jest.fn() }));

import { register, login, logout, getCurrentUser } from "../src/api/authApi";
import { request } from "../src/api/client";

const BASE_URL = "http://test:5000/api/v1";
const mockRequest = jest.mocked(request);

describe("authApi", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("register", () => {
        it("appelle request avec POST et les bons body/headers", async () => {
            const user = { id: "1", email: "a@b.com", createdAt: "2024-01-01" };
            mockRequest.mockResolvedValueOnce(user);

            const result = await register("a@b.com", "pass123");

            expect(mockRequest).toHaveBeenCalledWith(`${BASE_URL}/auth/register`, {
                method: "POST",
                body: JSON.stringify({ email: "a@b.com", password: "pass123" }),
                headers: { "Content-Type": "application/json" },
            });
            expect(result).toEqual(user);
        });
    });

    describe("login", () => {
        it("appelle request avec POST et les bons body/headers", async () => {
            const user = { id: "1", email: "a@b.com", createdAt: "2024-01-01" };
            mockRequest.mockResolvedValueOnce(user);

            const result = await login("a@b.com", "pass123");

            expect(mockRequest).toHaveBeenCalledWith(`${BASE_URL}/auth/login`, {
                method: "POST",
                body: JSON.stringify({ email: "a@b.com", password: "pass123" }),
                headers: { "Content-Type": "application/json" },
            });
            expect(result).toEqual(user);
        });
    });

    describe("logout", () => {
        it("appelle request avec POST, retourne void", async () => {
            mockRequest.mockResolvedValueOnce(undefined);

            const result = await logout();

            expect(mockRequest).toHaveBeenCalledWith(`${BASE_URL}/auth/logout`, {
                method: "POST",
            });
            expect(result).toBeUndefined();
        });
    });

    describe("getCurrentUser", () => {
        it("appelle request GET, retourne le user", async () => {
            const user = { id: "1", email: "a@b.com", createdAt: "2024-01-01" };
            mockRequest.mockResolvedValueOnce(user);

            const result = await getCurrentUser();

            expect(mockRequest).toHaveBeenCalledWith(`${BASE_URL}/auth/me`, {
                method: "GET",
            });
            expect(result).toEqual(user);
        });

        it("retourne null en cas d'erreur", async () => {
            mockRequest.mockRejectedValueOnce(new Error("Unauthorized"));

            const result = await getCurrentUser();

            expect(result).toBeNull();
        });
    });
});
