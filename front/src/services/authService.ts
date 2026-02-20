import {
    register as registerApi,
    login as loginApi,
    logout as logoutApi,
    getCurrentUser as getCurrentUserApi,
    type AuthResponse,
} from "../api/authApi";
import { AUTH_STORAGE_KEY } from "../constants/auth.constant";

interface User extends AuthResponse { }

const getStoredUser = (): User | null => {
    try {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
};

const storeUser = (user: User): void => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
};

const clearStoredUser = (): void => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
};

const register = async (email: string, password: string): Promise<User> => {
    const user = await registerApi(email, password);
    storeUser(user);
    return user;
};

const login = async (email: string, password: string): Promise<User> => {
    const user = await loginApi(email, password);
    storeUser(user);
    return user;
};

const logout = async (): Promise<void> => {
    await logoutApi();
    clearStoredUser();
};

const isLoggedIn = (): boolean => {
    const user = getStoredUser();
    return !!user;
};

const getCurrentUser = (): User | null => {
    return getStoredUser();
};

const validateSession = async (): Promise<User | null> => {
    const user = await getCurrentUserApi();
    if (user) {
        storeUser(user);
        return user;
    }

    clearStoredUser();
    return null;
};

export const authService = {
    register,
    login,
    logout,
    isLoggedIn,
    getCurrentUser,
    validateSession,
};

export type { User };
