import { Router } from "express";
import { list, getById, create, update, remove } from "@/controllers/product.controller.js";
import { uploadImages } from "@/middleware/upload.js";

const productRouter = Router();

productRouter.get("/products", list);
productRouter.get("/products/:id", getById);
productRouter.post("/products", uploadImages, create);
productRouter.put("/products/:id", uploadImages, update);
productRouter.delete("/products/:id", remove);

export { productRouter };
