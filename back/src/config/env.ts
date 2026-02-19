import "dotenv/config";
const requiredEnvVars = [
    "DATABASE_URL",
    "FRONTEND_URL",
    "BACKEND_URL",
] as const;

const missingVars = requiredEnvVars.filter((key) => !process.env[key])

if (missingVars.length > 0) {
    throw new Error(`Variables d'environnement manquantes : ${missingVars.join(", ")}`)
}

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";
const BACKEND_PORT = Number(new URL(BACKEND_URL).port) || 5000;
const DATABASE_URL = process.env.DATABASE_URL || "";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

export { BACKEND_URL, BACKEND_PORT, DATABASE_URL, FRONTEND_URL };
