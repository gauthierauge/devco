import { prisma } from "@/config/db.js"

type CreateProductData = {
    label: string
    description: string
    images: string[]
    price: number
    category: string
}

type UpdateProductData = {
    label?: string
    description?: string
    images?: string[]
    price?: number
    category?: string
}

const findManyProducts = (where: Record<string, unknown> = {}) =>
    prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
    })

const findProductById = (id: string) =>
    prisma.product.findUnique({ where: { id } })

const createProduct = (data: CreateProductData) =>
    prisma.product.create({ data })

const updateProduct = (id: string, data: UpdateProductData) =>
    prisma.product.update({ where: { id }, data })

const deleteProduct = (id: string) =>
    prisma.product.delete({ where: { id } })

export { findManyProducts, findProductById, createProduct, updateProduct, deleteProduct }
export type { CreateProductData, UpdateProductData }
