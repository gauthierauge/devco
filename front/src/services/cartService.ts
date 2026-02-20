import type { ProductDto } from "../api/productApi";
import { request } from "../api/client";

export interface CartItem {
    productId: string;
    quantity: number;
}

export interface CartItemWithProduct extends CartItem {
    product: ProductDto;
}

const STORAGE_KEY = "devco_cart";
const API_BASE = "/cart";

export const cartService = {

    getCart(): CartItem[] {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    },

    addItem(productId: string, quantity: number = 1): CartItem[] {
        const cart = this.getCart();
        const existing = cart.find((item) => item.productId === productId);

        if (existing) {
            existing.quantity += quantity;
        } else {
            cart.push({ productId, quantity });
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
        return cart;
    },

    updateQuantity(productId: string, quantity: number): CartItem[] {
        if (quantity <= 0) {
            return this.removeItem(productId);
        }

        const cart = this.getCart();
        const item = cart.find((item) => item.productId === productId);

        if (item) {
            item.quantity = quantity;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
        }

        return cart;
    },

    removeItem(productId: string): CartItem[] {
        const cart = this.getCart().filter((item) => item.productId !== productId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
        return cart;
    },

    clear(): void {
        localStorage.removeItem(STORAGE_KEY);
    },

    getCount(): number {
        return this.getCart().reduce((sum, item) => sum + item.quantity, 0);
    },

    isEmpty(): boolean {
        return this.getCart().length === 0;
    },

    async getServerCart(): Promise<CartItem[]> {
        try {
            const data = await request<{ items: CartItem[] }>(`${API_BASE}`);
            return data.items || [];
        } catch {
            return [];
        }
    },

    mergeCart(serverItems: CartItem[], localItems: CartItem[]): CartItem[] {
        const map = new Map<string, CartItem>();

        serverItems.forEach((item) => {
            map.set(item.productId, { ...item });
        });

        localItems.forEach((item) => {
            const existing = map.get(item.productId);
            if (existing) {
                existing.quantity += item.quantity;
            } else {
                map.set(item.productId, { ...item });
            }
        });

        return Array.from(map.values());
    },

    async syncCart(items?: CartItem[]): Promise<CartItem[]> {
        try {
            let itemsToSync: CartItem[];

            if (items !== undefined) {
                itemsToSync = items;
            } else {
                const localCart = this.getCart();
                const serverCart = await this.getServerCart();
                itemsToSync = this.mergeCart(serverCart, localCart);
            }

            await request(`${API_BASE}/sync`, {
                method: "POST",
                body: JSON.stringify({ items: itemsToSync }),
            });

            localStorage.setItem(STORAGE_KEY, JSON.stringify(itemsToSync));

            return itemsToSync;
        } catch (error) {
            console.error("Erreur lors de la synchronisation du panier:", error);
            return this.getCart();
        }
    },

    async addItemToServer(productId: string, quantity: number = 1): Promise<CartItem[] | null> {
        try {
            const data = await request<{ items: CartItem[] }>(`${API_BASE}/items`, {
                method: "POST",
                body: JSON.stringify({ productId, quantity }),
            });
            return data.items || null;
        } catch {
            return null;
        }
    },

    async updateQuantityServer(productId: string, quantity: number): Promise<CartItem[] | null> {
        try {
            const data = await request<{ items: CartItem[] }>(
                `${API_BASE}/items/${productId}`,
                {
                    method: "PUT",
                    body: JSON.stringify({ quantity }),
                }
            );
            return data.items || null;
        } catch {
            return null;
        }
    },

    async removeItemFromServer(productId: string): Promise<CartItem[] | null> {
        try {
            const data = await request<{ items: CartItem[] }>(
                `${API_BASE}/items/${productId}`,
                { method: "DELETE" }
            );
            return data.items || null;
        } catch {
            return null;
        }
    },
};
