import express from "express";
import helmet from "helmet";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { corsOptions } from "@/config/cors.js";
import { helmetOptions } from "@/config/helmet.js";
import { initRoutes } from "@/config/routes.js";
import { sessionMiddleware } from "./middleware/session.js";
import { csrfGenerateMiddleware, csrfVerifyMiddleware } from "./middleware/security/csrf.js";
import { requestLogger } from "@/middleware/requestLogger.js";
import { errorHandler, notFoundHandler } from "@/middleware/error.js";
import { reportToMiddleware } from "@/middleware/security/reportTo.js";
import { cspNonceMiddleware } from "@/middleware/security/cspNonce.js";
import { globalLimiter } from "@/middleware/security/rateLimiter.js";
import { xssSanitizer } from "@/middleware/security/xssSanitizer.js";

const createApp = () => {
    const app = express();
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const projectRoot = process.cwd();

    app.use(express.static(path.join(projectRoot, "public"), { dotfiles: "allow" }));
    app.use("/uploads", express.static(path.join(projectRoot, "public", "uploads")));

    app.use(sessionMiddleware);
    app.use(express.json({ limit: "10kb" }));
    app.use(express.json({ type: "application/csp-report", limit: "5kb" }));

    // Sécurité headers
    app.use(cspNonceMiddleware);
    app.use(csrfGenerateMiddleware);
    app.use(csrfVerifyMiddleware);

    app.use(helmet(helmetOptions));
    app.use(reportToMiddleware);
    app.use(cors(corsOptions));

    // Protections
    app.use(globalLimiter);
    app.use(xssSanitizer);

    app.use(requestLogger);

    initRoutes(app);

    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}

export { createApp };
