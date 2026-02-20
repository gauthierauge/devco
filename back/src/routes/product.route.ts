import { Router } from "express";
import { list, getById, create, update, remove } from "@/controllers/product.controller.js";
import { uploadImages } from "@/middleware/upload.js";
import { authMiddleware } from "@/middleware/security/auth.js";

const productRouter = Router();

productRouter.get("/products", list);
productRouter.get("/products/:id", getById);
productRouter.post("/products", authMiddleware, uploadImages, create);
productRouter.put("/products/:id", authMiddleware, uploadImages, update);
productRouter.delete("/products/:id", authMiddleware, remove);

export { productRouter };
