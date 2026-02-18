import express from "express";
import path from "node:path";
import helmet from "helmet";
import cors from "cors";
import { corsOptions } from "./config/cors.js";
import { helmetOptions } from "./config/helmet.js";
import {initRoutes} from "./config/routes.js";
import {requestLogger} from "./middleware/requestLogger.js";
import {errorHandler, notFoundHandler} from "./middleware/error.js";

const createApp = () => {
    const app = express();

    app.use(helmet(helmetOptions));
    app.use(cors(corsOptions));
    app.use(express.json());
    app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));

    app.use(requestLogger);

    initRoutes(app);

    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}

export { createApp };
