import { Express } from "express"
import {cspReportRouter} from "@/routes/cspReport.route.js";
import {API_PREFIX} from "@/constants/api.constant.js";
import { productRoutes } from "@/routes/productRoutes.js";

const initRoutes = (app: Express) => {
    app.use(API_PREFIX, cspReportRouter);
    app.use(API_PREFIX, productRoutes);
};

export { API_PREFIX, initRoutes };
