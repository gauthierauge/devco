import { Express } from "express";
import { productRoutes } from "../routes/productRoutes.js";

const initRoutes = (app: Express) => {
  app.use("/api", productRoutes);
};

export { initRoutes };
