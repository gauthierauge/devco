import { formatPrice, toView, filterProducts } from "../src/services/productService";
import type { ProductDto } from "../src/api/productApi";

const makeProduct = (overrides: Partial<ProductDto> = {}): ProductDto => ({
    id: "1",
    label: "Chaise",
    description: "Une belle chaise",
    images: ["/img.jpg"],
    price: 89.9,
    category: "Mobilier",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
    ...overrides,
});

describe("formatPrice", () => {
    it("formate 89.9 en format EUR fr-FR", () => {
        const result = formatPrice(89.9);
        expect(result).toContain("89,90");
        expect(result).toContain("€");
    });

    it("formate 0 en 0,00 €", () => {
        const result = formatPrice(0);
        expect(result).toContain("0,00");
        expect(result).toContain("€");
    });
});

describe("toView", () => {
    it("ajoute formattedPrice au ProductDto", () => {
        const product = makeProduct({ price: 42.5 });
        const view = toView(product);
        expect(view.formattedPrice).toContain("42,50");
        expect(view.formattedPrice).toContain("€");
        expect(view.id).toBe("1");
    });
});

describe("filterProducts", () => {
    const products = [
        makeProduct({ label: "Chaise en bois", description: "Artisanale", category: "Mobilier" }),
        makeProduct({ id: "2", label: "Table", description: "Grande table", category: "Mobilier" }),
        makeProduct({ id: "3", label: "Lampe", description: "LED moderne", category: "Luminaire" }),
    ];

    it("retourne tout si query vide", () => {
        expect(filterProducts(products, "")).toEqual(products);
    });

    it("filtre par label (case insensitive)", () => {
        const result = filterProducts(products, "chaise");
        expect(result).toHaveLength(1);
        expect(result[0].label).toBe("Chaise en bois");
    });

    it("filtre par description", () => {
        const result = filterProducts(products, "LED");
        expect(result).toHaveLength(1);
        expect(result[0].label).toBe("Lampe");
    });

    it("filtre par category", () => {
        const result = filterProducts(products, "luminaire");
        expect(result).toHaveLength(1);
        expect(result[0].label).toBe("Lampe");
    });

    it("gère les espaces en début/fin de query", () => {
        const result = filterProducts(products, "  table  ");
        expect(result).toHaveLength(1);
        expect(result[0].label).toBe("Table");
    });
});
