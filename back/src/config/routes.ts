import { Express } from "express"
import {cspReportRouter} from "@/routes/cspReport.route.js";
import {API_PREFIX} from "@/constants/api.constant.js";
import { productRouter } from "@/routes/product.route.js";
import { authRouter } from "@/routes/auth.route.js";
import { statsRouter } from "@/routes/stats.route.js";

const initRoutes = (app: Express) => {
    app.use(API_PREFIX, cspReportRouter);
    app.use(API_PREFIX, productRouter);
    app.use(API_PREFIX, authRouter);
    app.use(API_PREFIX, statsRouter);
};

export { API_PREFIX, initRoutes };
