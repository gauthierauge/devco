import { Request, Response } from "express";
import {logger} from "../config/logger.js";
import {cleanupOldReports, saveCspReport} from "../services/cspReport.service.js";

// POST /api/csp-report
const receiveCspReport = async (req: Request, res: Response) => {
    const payload = req.body?.["csp-report"] ?? req.body;
    const result = await saveCspReport(payload);

    if (!result.saved) {
        logger.debug({ reason: result.reason }, "Rapport CSP ignoré");
        res.status(204).send();
        return;
    }

    logger.info({ violatedDirective: payload?.["violated-directive"] }, "Rapport CSP enregistré");
    res.status(204).send();
}

// GET /api/csp-reports
const listCspReports = async (_req: Request, res: Response) => {
    const reports = await cleanupOldReports();

    res.json(reports);
}

export {receiveCspReport, listCspReports};
