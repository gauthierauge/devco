jest.mock("@/config/env", () => ({ API_URL: "http://test:5000" }));

import { toProductCardView } from "../src/mappers/productPresenter";
import type { ProductView } from "../src/services/productService";

const makeProductView = (overrides: Partial<ProductView> = {}): ProductView => ({
    id: "1",
    label: "Chaise",
    description: "Une belle chaise",
    images: ["/uploads/img.jpg"],
    price: 89.9,
    category: "Mobilier",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
    formattedPrice: "89,90 €",
    ...overrides,
});

describe("toProductCardView", () => {
    it("ajoute imageUrl avec le préfixe API_URL pour les images commençant par /", () => {
        const view = toProductCardView(makeProductView({ images: ["/uploads/img.jpg"] }));
        expect(view.imageUrl).toBe("http://test:5000/uploads/img.jpg");
    });

    it("ne préfixe pas les URLs absolues", () => {
        const view = toProductCardView(makeProductView({ images: ["https://cdn.example.com/img.jpg"] }));
        expect(view.imageUrl).toBe("https://cdn.example.com/img.jpg");
    });

    it("gère un tableau d'images vide", () => {
        const view = toProductCardView(makeProductView({ images: [] }));
        expect(view.imageUrl).toBe("");
    });
});
