import rateLimit from "express-rate-limit"

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Trop de requêtes, réessayez plus tard" },
})

export { globalLimiter }
