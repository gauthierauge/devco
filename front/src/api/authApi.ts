import { request } from "./client";
import { BASE_URL } from "../constants/api.constant";

interface AuthResponse {
    id: string;
    email: string;
    createdAt: string;
}

const register = async (email: string, password: string): Promise<AuthResponse> =>
    request<AuthResponse>(`${BASE_URL}/auth/register`, {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: { "Content-Type": "application/json" },
    });

const login = async (email: string, password: string): Promise<AuthResponse> =>
    request<AuthResponse>(`${BASE_URL}/auth/login`, {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: { "Content-Type": "application/json" },
    });

const logout = async (): Promise<void> =>
    request<void>(`${BASE_URL}/auth/logout`, {
        method: "POST",
    }).then(() => undefined);

const getCurrentUser = async (): Promise<AuthResponse | null> => {
    try {
        return await request<AuthResponse>(`${BASE_URL}/auth/me`, {
            method: "GET",
        });
    } catch {
        return null;
    }
};

export { register, login, logout, getCurrentUser, type AuthResponse };
