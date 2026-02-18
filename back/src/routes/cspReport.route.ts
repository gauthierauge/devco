import { Router } from "express"
import { receiveCspReport, listCspReports } from "../controllers/cspReport.controller.js"
import { asyncHandler } from "../middleware/error.js"

const cspReportRouter = Router()

cspReportRouter.post("/csp-report", asyncHandler(receiveCspReport))

//(TODO: ajouter middleware auth quand il sera prêt les gars)
cspReportRouter.get("/csp-reports", /* authMiddleware, */ asyncHandler(listCspReports))

export { cspReportRouter }
