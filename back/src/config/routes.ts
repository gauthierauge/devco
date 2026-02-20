import { Express, Request, Response } from "express"
import { cspReportRouter } from "@/routes/cspReport.route.js";
import { API_PREFIX } from "@/constants/api.constant.js";
import { productRouter } from "@/routes/product.route.js";
import { authRouter } from "@/routes/auth.route.js";
import { statsRouter } from "@/routes/stats.route.js";
import { cartRouter } from "@/routes/cart.route.js";

const initRoutes = (app: Express) => {
    app.get(`${API_PREFIX}/csrf-token`, (req: Request, res: Response) => {
        const token = res.locals.csrfToken
        res.json({ csrfToken: token })
    })

    app.use(`${API_PREFIX}/auth`, authRouter);
    app.use(API_PREFIX, cspReportRouter);
    app.use(API_PREFIX, productRouter);
    app.use(API_PREFIX, authRouter);
    app.use(API_PREFIX, statsRouter);
    app.use(`${API_PREFIX}/cart`, cartRouter);
};

export { API_PREFIX, initRoutes };
