import { prisma } from "../config/db.js";

type CreateProductInput = {
  label: string;
  description: string;
  images: string[];
  price: number;
  category: string;
};

type UpdateProductInput = {
  label?: string;
  description?: string;
  images?: string[];
  price?: number;
  category?: string;
};

type ListProductsQuery = {
  q?: string;
  category?: string;
};

const listProducts = (query: ListProductsQuery = {}) => {
  const where: Record<string, unknown> = {};

  if (query.q) {
    where.OR = [
      { label: { contains: query.q, mode: "insensitive" } },
      { description: { contains: query.q, mode: "insensitive" } },
    ];
  }

  if (query.category) {
    where.category = { equals: query.category, mode: "insensitive" };
  }

  return prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
};

const getProductById = (id: string) => prisma.product.findUnique({ where: { id } });

const createProduct = (data: CreateProductInput) =>
  prisma.product.create({
    data: {
      label: data.label,
      description: data.description,
      images: data.images,
      price: data.price,
      category: data.category,
    },
  });

const updateProduct = (id: string, data: UpdateProductInput) =>
  prisma.product.update({
    where: { id },
    data,
  });

const deleteProduct = (id: string) => prisma.product.delete({ where: { id } });

export { listProducts, getProductById, createProduct, updateProduct, deleteProduct };
