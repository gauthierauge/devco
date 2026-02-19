import express from "express";
import helmet from "helmet";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { corsOptions } from "./config/cors.js";
import { helmetOptions } from "./config/helmet.js";
import { sessionMiddleware } from "./middleware/session.js";
import { csrfGenerateMiddleware, csrfVerifyMiddleware } from "./middleware/security/csrf.js";
import { initRoutes } from "./config/routes.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { errorHandler, notFoundHandler } from "./middleware/error.js";
import { reportToMiddleware } from "./middleware/security/reportTo.js";
import { cspNonceMiddleware } from "./middleware/security/cspNonce.js";

const createApp = () => {
    const app = express();
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    app.use(express.static(path.join(__dirname, "public"), { dotfiles: "allow" }));

    app.use(sessionMiddleware);
    app.use(csrfGenerateMiddleware);
    app.use(csrfVerifyMiddleware);

    app.use(cspNonceMiddleware);
    app.use(helmet(helmetOptions));
    app.use(reportToMiddleware);
    app.use(cors(corsOptions));
    app.use(express.json());
    app.use(express.json({ type: "application/csp-report" }));

    app.use(requestLogger);

    app.use(express.static(path.join(__dirname, "public")));
    initRoutes(app);

    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}

export { createApp };
