import { Router } from "express";
import { list, getById, create, update, remove } from "../controllers/productController.js";
import { uploadImages } from "../middleware/upload.js";

const productRoutes = Router();

productRoutes.get("/products", list);
productRoutes.get("/products/:id", getById);
productRoutes.post("/products", uploadImages, create);
productRoutes.put("/products/:id", uploadImages, update);
productRoutes.delete("/products/:id", remove);

export { productRoutes };
