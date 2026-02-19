import {MAX_REPORTS, VALID_CSP_FIELDS} from "@/constants/cspReport.constant.js";
import { Prisma } from "@/generated/prisma/client.js";
import {
    countCspReports,
    deleteCspReportsByIds,
    createCspReport,
    getLatestCspReports
} from "@/repositories/cspReport.repository.js";
import {logger} from "@/config/logger.js";

const cleanupOldReports = async () => {
    const count = await countCspReports()

    if (count > MAX_REPORTS) {
        const toDelete = count - MAX_REPORTS
        const oldestReports = await getLatestCspReports(toDelete)

        await deleteCspReportsByIds(oldestReports.map((r) => r.id))
        logger.info({ deleted: toDelete }, "Nettoyage des anciens rapports CSP")
    }
}

const saveCspReport = async (payload: unknown) => {
    if (!isValidCspPayload(payload)) {
        return { saved: false, reason: "Payload CSP invalide" }
    }

    const report = await createCspReport(payload as Prisma.InputJsonValue)

    await cleanupOldReports()

    return { saved: true, report }
}

const isValidCspPayload = (payload: unknown): payload is Record<string, unknown> => {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) return false

    const record = payload as Record<string, unknown>
    const hasRequiredFields =
        typeof record["document-uri"] === "string" &&
        typeof record["violated-directive"] === "string"

    const hasOnlyValidFields = Object.keys(record).every(
        (key) => VALID_CSP_FIELDS.includes(key)
    )

    return hasRequiredFields && hasOnlyValidFields
}
export {cleanupOldReports, saveCspReport}
