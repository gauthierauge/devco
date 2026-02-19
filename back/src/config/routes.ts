import { Express } from "express"
import { cspReportRouter } from "../routes/cspReport.route.js"
import { authRouter } from "../routes/auth.route.js"

const initRoutes = (app: Express) => {
    app.use("/api/auth", authRouter)
    app.use("/api", cspReportRouter)
}

export { initRoutes }
