import {BACKEND_URL} from "@/config/env.js";
import { Request, Response, NextFunction } from "express";

const reportToGroup = JSON.stringify({
    group: "csp-endpoint",
    max_age: 10886400,
    endpoints: [{ url: `${BACKEND_URL}/api/csp-report` }],
});

const reportToMiddleware = (req: Request, res: Response, next: NextFunction) => {
    res.header("Report-to", reportToGroup)
    next()
};

export { reportToMiddleware };

//corriger ça
