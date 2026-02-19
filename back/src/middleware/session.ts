import session, { Store } from "express-session"
import { prisma } from "../config/db.js"
import { logger } from "../config/logger.js"

class PrismaStore extends Store {
    async get(sid: string, callback: (err?: any, session?: any) => void) {
        try {
            const record = await prisma.session.findUnique({ where: { id: sid } })
            if (!record) return callback(null, null)
            if (record.expiresAt < new Date()) {
                await prisma.session.delete({ where: { id: sid } })
                return callback(null, null)
            }
            callback(null, record.data)
        } catch (error) {
            logger.error({ error, sid }, "Error getting session")
            callback(error)
        }
    }

    async set(sid: string, data: any, callback?: (err?: any) => void) {
        try {
            const expiresAt = new Date(data.cookie.expires || Date.now() + 24 * 60 * 60 * 1000)
            await prisma.session.upsert({
                where: { id: sid },
                update: { data, expiresAt },
                create: { id: sid, data, expiresAt },
            })
            callback?.()
        } catch (error) {
            logger.error({ error, sid }, "Error setting session")
            callback?.(error)
        }
    }

    async destroy(sid: string, callback?: (err?: any) => void) {
        try {
            await prisma.session.delete({ where: { id: sid } })
            callback?.()
        } catch (error) {
            if ((error as any).code === "P2025") return callback?.()
            logger.error({ error, sid }, "Error destroying session")
            callback?.(error)
        }
    }

    async clear(callback?: (err?: any) => void) {
        try {
            await prisma.session.deleteMany({})
            callback?.()
        } catch (error) {
            logger.error({ error }, "Error clearing sessions")
            callback?.(error)
        }
    }

    async touch(sid: string, data: any, callback?: (err?: any) => void) {
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
