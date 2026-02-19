import session from "express-session"
import connectPgSimple from "connect-pg-simple"
import { pool } from "../config/postgres.js"

const PostgresSessionStore = connectPgSimple(session) as any
const sessionStore = new PostgresSessionStore({
    pool,
})

const sessionMiddleware = session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || "dev-session-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000, // 24 heures
    },
})

export { sessionMiddleware }
