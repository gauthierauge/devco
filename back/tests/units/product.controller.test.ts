import { jest } from "@jest/globals"
import { Request, Response } from "express"

const mockedService = {
    listProducts: jest.fn<any>(),
    getProductById: jest.fn<any>(),
    createProduct: jest.fn<any>(),
    updateProduct: jest.fn<any>(),
    deleteProduct: jest.fn<any>(),
}

jest.unstable_mockModule("@/config/db.js", () => ({ prisma: {} }))
jest.unstable_mockModule("@/repositories/product.repository.js", () => ({
    findManyProducts: jest.fn(),
    findProductById: jest.fn(),
    createProduct: jest.fn(),
    updateProduct: jest.fn(),
    deleteProduct: jest.fn(),
}))
jest.unstable_mockModule("@/services/product.service.js", () => mockedService)

const { list, getById, create, update, remove } = await import("@/controllers/product.controller.js")

const mockRes = () => {
    const res = {} as Response
    res.status = jest.fn().mockReturnThis() as any
    res.json = jest.fn().mockReturnThis() as any
    res.send = jest.fn().mockReturnThis() as any
    return res
}

const fakeProduct = {
    id: "1",
    label: "Laptop",
    description: "A laptop",
    category: "Electronics",
    price: 999.99,
    images: ["/uploads/img.jpg"],
    createdAt: new Date(),
    updatedAt: new Date(),
}

describe("list", () => {
    beforeEach(() => jest.clearAllMocks())

    it("retourne les produits en JSON avec le prix en Number", async () => {
        mockedService.listProducts.mockResolvedValue([fakeProduct])
        const req = { query: {} } as unknown as Request
        const res = mockRes()

        await list(req, res)

        expect(res.json).toHaveBeenCalledWith([expect.objectContaining({ price: 999.99 })])
    })
})

describe("getById", () => {
    beforeEach(() => jest.clearAllMocks())

    it("retourne 404 si le produit est pas trouvé", async () => {
        mockedService.getProductById.mockResolvedValue(null)
        const req = { params: { id: "999" } } as unknown as Request
        const res = mockRes()

        await getById(req, res)

        expect(res.status).toHaveBeenCalledWith(404)
        expect(res.json).toHaveBeenCalledWith({ message: "Product not found" })
    })

    it("retourne le produit si trouvé", async () => {
        mockedService.getProductById.mockResolvedValue(fakeProduct)
        const req = { params: { id: "1" } } as unknown as Request
        const res = mockRes()

        await getById(req, res)

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ label: "Laptop", price: 999.99 }))
    })
})

describe("create", () => {
    beforeEach(() => jest.clearAllMocks())

    it("retourne 400 si les champs obligatoire sont manquants", async () => {
        const req = { body: { label: "Only label" }, files: [] } as unknown as Request
        const res = mockRes()

        await create(req, res)

        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith({ message: "Missing required fields" })
    })

    it("crée le produit avec status 201", async () => {
        mockedService.createProduct.mockResolvedValue(fakeProduct)
        const req = {
            body: { label: "Laptop", description: "A laptop", category: "Electronics", price: "999.99" },
            files: [{ filename: "img.jpg" }],
        } as unknown as Request
        const res = mockRes()

        await create(req, res)

        expect(mockedService.createProduct).toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledWith(201)
    })
})

describe("update", () => {
    beforeEach(() => jest.clearAllMocks())

    it("retourne 400 si le prix est pas valide", async () => {
        const req = { params: { id: "1" }, body: { price: "not-a-number" }, files: [] } as unknown as Request
        const res = mockRes()

        await update(req, res)

        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith({ message: "Invalid price" })
    })

    it("retourne 404 si le produit existe pas", async () => {
        mockedService.updateProduct.mockRejectedValue(new Error("Not found"))
        const req = { params: { id: "999" }, body: { label: "Updated" } } as unknown as Request
        const res = mockRes()

        await update(req, res)

        expect(res.status).toHaveBeenCalledWith(404)
        expect(res.json).toHaveBeenCalledWith({ message: "Product not found" })
    })
})

describe("remove", () => {
    beforeEach(() => jest.clearAllMocks())

    it("retourne 204 si supprimé", async () => {
        mockedService.deleteProduct.mockResolvedValue(fakeProduct)
        const req = { params: { id: "1" } } as unknown as Request
        const res = mockRes()

        await remove(req, res)

        expect(res.status).toHaveBeenCalledWith(204)
        expect(res.send).toHaveBeenCalled()
    })

    it("retourne 404 si produit existe pas", async () => {
        mockedService.deleteProduct.mockRejectedValue(new Error("Not found"))
        const req = { params: { id: "999" } } as unknown as Request
        const res = mockRes()

        await remove(req, res)

        expect(res.status).toHaveBeenCalledWith(404)
        expect(res.json).toHaveBeenCalledWith({ message: "Product not found" })
    })
})
