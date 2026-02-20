import { Router } from "express"
import { asyncHandler } from "@/middleware/error.js"
import { openCors } from "@/config/cors.js"
import { getStats } from "@/controllers/stats.controller.js"

const statsRouter = Router()

statsRouter.get("/stats", openCors, asyncHandler(getStats))

export { statsRouter }
