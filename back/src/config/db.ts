import { PrismaClient } from "@/generated/prisma/client.js"
import { PrismaPg } from "@prisma/adapter-pg"
import { DATABASE_URL } from "@/config/env.js"

const adapter = new PrismaPg({ connectionString: DATABASE_URL })

const prisma = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["error"]
});

export { prisma }
