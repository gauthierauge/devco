import { Request, Response, NextFunction } from "express"
import { logger } from "@/config/logger.js"

const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now()

    res.on("finish", () => {
        const duration = Date.now() - start
        const { method, originalUrl } = req
        const { statusCode } = res

        const logData = {
            method,
            url: originalUrl,
            status: statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
        }

        if (statusCode >= 500) {
            logger.error(logData, "Erreur serveur")
        } else if (statusCode >= 400) {
            logger.warn(logData, "Erreur client")
        } else {
            logger.info(logData, "Requête traitée")
        }
    })

    next()
}

export { requestLogger }
