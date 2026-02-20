import { Request, Response } from "express"
import { getProductStats } from "@/services/stats.service.js"

const getStats = async (_req: Request, res: Response) => {
    const stats = await getProductStats()
    res.json(stats)
}

export { getStats }
