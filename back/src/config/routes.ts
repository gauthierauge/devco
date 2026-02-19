import { Express } from "express"
import {cspReportRouter} from "@/routes/cspReport.route.js";
import {API_PREFIX} from "@/constants/api.constant.js";

const initRoutes = (app: Express) => {
    app.use(API_PREFIX, cspReportRouter);
};

export { API_PREFIX, initRoutes };
