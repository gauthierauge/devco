import { jest } from "@jest/globals"

const mockedRepo = {
    findManyProducts: jest.fn<any>(),
    findProductById: jest.fn<any>(),
    createProduct: jest.fn<any>(),
    updateProduct: jest.fn<any>(),
    deleteProduct: jest.fn<any>(),
}

jest.unstable_mockModule("@/config/db.js", () => ({ prisma: {} }))
jest.unstable_mockModule("@/repositories/product.repository.js", () => mockedRepo)

const { listProducts, getProductById, createProduct, updateProduct, deleteProduct } = await import("@/services/product.service.js")

const now = new Date()

const fakeProduct = {
    id: "1",
    label: "Test",
    description: "desc",
    category: "cat",
    price: 10,
    images: [] as string[],
    createdAt: now,
    updatedAt: now,
}

describe("listProducts", () => {
    beforeEach(() => jest.clearAllMocks())

    it("appelle findManyProducts sans filtre par defaut", async () => {
        mockedRepo.findManyProducts.mockResolvedValue([])

        await listProducts()

        expect(mockedRepo.findManyProducts).toHaveBeenCalledWith({})
    })

    it("construit un filtre OR pour query.q", async () => {
        mockedRepo.findManyProducts.mockResolvedValue([])

        await listProducts({ q: "test" })

        expect(mockedRepo.findManyProducts).toHaveBeenCalledWith({
            OR: [
                { label: { contains: "test", mode: "insensitive" } },
                { description: { contains: "test", mode: "insensitive" } },
            ],
        })
    })

    it("construit le filtre par catégorie", async () => {
        mockedRepo.findManyProducts.mockResolvedValue([])

        await listProducts({ category: "electronics" })

        expect(mockedRepo.findManyProducts).toHaveBeenCalledWith({
            category: { equals: "electronics", mode: "insensitive" },
        })
    })
})

describe("getProductById", () => {
    it("delegue a findProductById", async () => {
        mockedRepo.findProductById.mockResolvedValue(fakeProduct)

        const result = await getProductById("1")

        expect(mockedRepo.findProductById).toHaveBeenCalledWith("1")
        expect(result).toEqual(fakeProduct)
    })
})

describe("createProduct", () => {
    it("delegue au repo createProduct", async () => {
        const data = { label: "New", description: "desc", category: "cat", price: 5, images: ["/img.jpg"] }
        mockedRepo.createProduct.mockResolvedValue({ ...fakeProduct, ...data })

        const result = await createProduct(data)

        expect(mockedRepo.createProduct).toHaveBeenCalledWith(data)
        expect(result).toBeDefined()
    })
})

describe("updateProduct", () => {
    it("delegue au repo updateProduct", async () => {
        const data = { label: "Updated" }
        mockedRepo.updateProduct.mockResolvedValue({ ...fakeProduct, label: "Updated" })

        const result = await updateProduct("1", data)

        expect(mockedRepo.updateProduct).toHaveBeenCalledWith("1", data)
        expect(result).toBeDefined()
    })
})

describe("deleteProduct", () => {
    it("delegue au repo deleteProduct", async () => {
        mockedRepo.deleteProduct.mockResolvedValue(fakeProduct)

        const result = await deleteProduct("1")

        expect(mockedRepo.deleteProduct).toHaveBeenCalledWith("1")
        expect(result).toEqual(fakeProduct)
    })
})
