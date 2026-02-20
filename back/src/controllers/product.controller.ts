import { Request, Response } from "express";
import { listProducts, getProductById, createProduct, updateProduct, deleteProduct } from "@/services/product.service.js";
import { HttpError } from "@/middleware/error.js";
import type { UploadedFile } from "@/middleware/upload.js";

const parsePrice = (value: unknown) => {
  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : null;
};

const toResponse = (product: { price: unknown }) => ({
  ...product,
  price: Number(product.price),
});

const list = async (req: Request, res: Response) => {
  const q = typeof req.query.q === "string"
    ? req.query.q
    : undefined;
  const category = typeof req.query.category === "string"
    ? req.query.category
    : undefined;

  const products = await listProducts({ q, category });
  res.json(products.map(toResponse));
};

const getById = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const product = await getProductById(id);

  if (!product) {
    res.status(404).json({ message: "Product not found" });
    return;
  }
  res.json(toResponse(product));
};

const create = async (req: Request, res: Response) => {
  const { label, description, category } = req.body;
  const price = parsePrice(req.body.price);
  const files = ((req as Request & { files?: UploadedFile[] }).files ?? []) as UploadedFile[];
  const images = files.map((file) => `/uploads/${file.filename}`);

  if (!label || !description || !category || price === null || images.length === 0) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }

  const product = await createProduct({
    label,
    description,
    category,
    price,
    images
  });

  res.status(201).json(toResponse(product));
};

const update = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const existing = await getProductById(id);

  if (!existing) {
    throw new HttpError(404, "Product not found");
  }

  const { label, description, category } = req.body;
  const price = req.body.price !== undefined
    ? parsePrice(req.body.price)
    : undefined;

  if (req.body.price !== undefined && price === null) {
    res.status(400).json({ message: "Invalid price" });
    return;
  }

  const files = ((req as Request & { files?: UploadedFile[] }).files ?? []) as UploadedFile[];
  const images = files.length > 0 ? files.map((file) => `/uploads/${file.filename}`) : undefined;

  const product = await updateProduct(id, {
    label,
    description,
    category,
    price: price ?? undefined,
    images
  });
  res.json(toResponse(product));
};

const remove = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const existing = await getProductById(id);

  if (!existing) {
    throw new HttpError(404, "Product not found");
  }

  await deleteProduct(id);
  res.status(204).send();
};

export { list, getById, create, update, remove };
