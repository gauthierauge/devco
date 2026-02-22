import session, { SessionData, Store } from "express-session"
import { Prisma } from "@/generated/prisma/client.js"
import { prisma } from "@/config/db.js"
import { logger } from "@/config/logger.js"

class PrismaStore extends Store {
    async get(sid: string, callback: (err: unknown, session?: SessionData | null) => void) {
        try {
            const record = await prisma.session.findUnique({ where: { id: sid } })
            if (!record) return callback(null, null)
            if (record.expiresAt < new Date()) {
                await prisma.session.delete({ where: { id: sid } })
                return callback(null, null)
            }
            callback(null, record.data as unknown as SessionData)
        } catch (error) {
            logger.error({ error, sid }, "Error getting session")
            callback(error)
        }
    }

    async set(sid: string, data: SessionData, callback?: (err?: unknown) => void) {
        try {
            const expiresAt = new Date(data.cookie.expires || Date.now() + 24 * 60 * 60 * 1000)
            await prisma.session.upsert({
                where: { id: sid },
                update: { data: data as unknown as Prisma.JsonObject, expiresAt },
                create: { id: sid, data: data as unknown as Prisma.JsonObject, expiresAt },
            })
            callback?.()
        } catch (error) {
            logger.error({ error, sid }, "Error setting session")
            callback?.(error)
        }
    }

    async destroy(sid: string, callback?: (err?: unknown) => void) {
        try {
            await prisma.session.delete({ where: { id: sid } })
            callback?.()
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") return callback?.()
            logger.error({ error, sid }, "Error destroying session")
            callback?.(error)
        }
    }

    async clear(callback?: (err?: unknown) => void) {
        try {
            await prisma.session.deleteMany({})
            callback?.()
        } catch (error) {
            logger.error({ error }, "Error clearing sessions")
            callback?.(error)
        }
    }

    async touch(sid: string, data: SessionData, callback?: (err?: unknown) => void) {
        try {
            const expiresAt = new Date(data.cookie.expires || Date.now() + 24 * 60 * 60 * 1000)
            await prisma.session.update({ where: { id: sid }, data: { expiresAt } })
            callback?.()
        } catch (error) {
            logger.error({ error, sid }, "Error touching session")
            callback?.(error)
        }
    }
}

const sessionMiddleware = session({
    store: new PrismaStore(),
    secret: process.env.SESSION_SECRET || "dev-session-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
    },
})

export { sessionMiddleware }
