import { HelmetOptions } from "helmet"
import { IncomingMessage, ServerResponse } from "http"
import { BACKEND_URL } from "./env.js"

const helmetOptions: HelmetOptions = {
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'unsafe-inline'", (_req: IncomingMessage, res: ServerResponse) => `'nonce-${(res as any).locals.cspNonce}'`],
            styleSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "blob:"],
            connectSrc: ["'self'", BACKEND_URL],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            frameAncestors: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            requireTrustedTypesFor: ["'script'"],
            reportUri: "/api/csp-report",
            reportTo: "csp-endpoint",
        },
    },
    crossOriginEmbedderPolicy: false,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
    },
}

export { helmetOptions }
