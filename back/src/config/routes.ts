import { Express } from "express"
import {cspReportRouter} from "../routes/cspReport.route.js";

const initRoutes = (app: Express) => {
    app.use("/api", cspReportRouter);
}

export { initRoutes }
