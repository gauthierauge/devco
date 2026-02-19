import cors from "cors";
import {FRONTEND_URL} from "@/config/env.js";

const allowedOrigin = FRONTEND_URL ?? "http://localhost:3000";

const corsOptions: cors.CorsOptions = {
    origin: allowedOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
    exposedHeaders: ["X-CSRF-Token"],
    maxAge: 600,
}

const openCorsOptions: cors.CorsOptions = {
    origin: "*",
    methods: ["GET"],
    maxAge: 600,
}

const openCors = cors(openCorsOptions);

export { corsOptions, openCors };
