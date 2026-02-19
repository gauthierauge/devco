import {
    findManyProducts,
    findProductById,
    createProduct as createProductInDb,
    updateProduct as updateProductInDb,
    deleteProduct as deleteProductInDb,
} from "@/repositories/product.repository.js"
import type { CreateProductData, UpdateProductData } from "@/repositories/product.repository.js"

type ListProductsQuery = {
    q?: string
    category?: string
}

const listProducts = (query: ListProductsQuery = {}) => {
    const where: Record<string, unknown> = {}

    if (query.q) {
        where.OR = [
            { label: { contains: query.q, mode: "insensitive" } },
            { description: { contains: query.q, mode: "insensitive" } },
        ]
    }

    if (query.category) {
        where.category = { equals: query.category, mode: "insensitive" }
    }

    return findManyProducts(where)
}

const getProductById = (id: string) => findProductById(id)

const createProduct = (data: CreateProductData) => createProductInDb(data)

const updateProduct = (id: string, data: UpdateProductData) => updateProductInDb(id, data)

const deleteProduct = (id: string) => deleteProductInDb(id)

export { listProducts, getProductById, createProduct, updateProduct, deleteProduct }
