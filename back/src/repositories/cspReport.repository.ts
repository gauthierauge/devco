import { prisma } from "@/config/db.js"
import { Prisma } from "@/generated/prisma/client.js"

const createCspReport = async (payload: Prisma.InputJsonValue) =>
    prisma.cspReport.create({ data: { payload } })

const getLatestCspReports = async (limit: number = 50) =>
    prisma.cspReport.findMany({
        orderBy: { createdAt: "asc" },
        take: limit,
        select: { id: true },
    })

const deleteCspReportsByIds = async (ids: number[]) =>
    prisma.cspReport.deleteMany({
        where: { id: { in: ids } },
    })

const countCspReports = async () =>
    prisma.cspReport.count()

const findAllCspReports = async () =>
    prisma.cspReport.findMany({ orderBy: { createdAt: "desc" } })

export { createCspReport, getLatestCspReports, countCspReports, deleteCspReportsByIds, findAllCspReports }
