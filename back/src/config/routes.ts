import { Express, Request, Response } from "express"
import { cspReportRouter } from "@/routes/cspReport.route.js";
import { API_PREFIX } from "@/constants/api.constant.js";
import { productRouter } from "@/routes/product.route.js";
import { authRouter } from "@/routes/auth.route.js";

const initRoutes = (app: Express) => {
    // Route CSRF token (doit être avant les autres routes)
    app.get(`${API_PREFIX}/csrf-token`, (req: Request, res: Response) => {
        const token = res.locals.csrfToken
        res.json({ csrfToken: token })
    })

    app.use(`${API_PREFIX}/auth`, authRouter);
    app.use(API_PREFIX, cspReportRouter);
    app.use(API_PREFIX, productRouter);
};

export { API_PREFIX, initRoutes };
