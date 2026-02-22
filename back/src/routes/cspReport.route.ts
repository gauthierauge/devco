import { Router } from "express"
import { receiveCspReport, listCspReports } from "@/controllers/cspReport.controller.js"
import { asyncHandler } from "@/middleware/error.js"

const cspReportRouter = Router()

cspReportRouter.post("/csp-report", asyncHandler(receiveCspReport))

cspReportRouter.get("/csp-reports", asyncHandler(listCspReports))

export { cspReportRouter }
