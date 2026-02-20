jest.mock("@/config/env", () => ({ API_URL: "http://test:5000" }));
jest.mock("@/api/client", () => ({ request: jest.fn() }));

import { listProducts, createProduct, deleteProduct } from "@/api/productApi";
import { request } from "@/api/client";

const BASE_URL = "http://test:5000/api/v1";
const mockRequest = jest.mocked(request);

describe("productApi", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("listProducts", () => {
        it("construit l'URL avec les query params", async () => {
            mockRequest.mockResolvedValueOnce([]);

            await listProducts({ q: "chaise", category: "Mobilier" });

            const calledUrl = mockRequest.mock.calls[0][0] as string;
            expect(calledUrl).toContain(`${BASE_URL}/products?`);
            expect(calledUrl).toContain("q=chaise");
            expect(calledUrl).toContain("category=Mobilier");
        });

        it("URL sans params si pas de filtre", async () => {
            mockRequest.mockResolvedValueOnce([]);

            await listProducts();

            expect(mockRequest).toHaveBeenCalledWith(`${BASE_URL}/products`);
        });
    });

    describe("createProduct", () => {
        it("construit un FormData avec les champs", async () => {
            mockRequest.mockResolvedValueOnce({});

            const file = new File(["img"], "photo.jpg", { type: "image/jpeg" });
            await createProduct({
                label: "Chaise",
                description: "Belle chaise",
                category: "Mobilier",
                price: 49.99,
                images: [file],
            });

            expect(mockRequest).toHaveBeenCalledWith(
                `${BASE_URL}/products`,
                expect.objectContaining({
                    method: "POST",
                })
            );
            const body = mockRequest.mock.calls[0][1]!.body as FormData;
            expect(body.get("label")).toBe("Chaise");
            expect(body.get("description")).toBe("Belle chaise");
            expect(body.get("category")).toBe("Mobilier");
            expect(body.get("price")).toBe("49.99");
            expect(body.get("images")).toBeInstanceOf(File);
        });
    });

    describe("deleteProduct", () => {
        it("appelle request DELETE", async () => {
            mockRequest.mockResolvedValueOnce(undefined);

            await deleteProduct("42");

            expect(mockRequest).toHaveBeenCalledWith(`${BASE_URL}/products/42`, {
                method: "DELETE",
            });
        });
    });
});
