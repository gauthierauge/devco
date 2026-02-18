const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";
const BACKEND_PORT = Number(new URL(BACKEND_URL).port) || 5000;
const DATABASE_URL = process.env.DATABASE_URL || "";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key-change-in-production";

export { BACKEND_URL, BACKEND_PORT, DATABASE_URL, FRONTEND_URL, JWT_SECRET };
