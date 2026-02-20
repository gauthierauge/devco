import { jest } from "@jest/globals"
import request from "supertest";
import path from "node:path";
import type { Request, Response, NextFunction } from "express";

jest.unstable_mockModule("@/middleware/session.js", () => ({
    sessionMiddleware: (req: Request, _res: Response, next: NextFunction) => {
        (req as any).session = { userId: 1 };
        next();
    },
}));
jest.unstable_mockModule("@/middleware/security/auth.js", () => ({
    authMiddleware: (req: Request, _res: Response, next: NextFunction) => {
        req.userId = 1;
        next();
    },
}));
jest.unstable_mockModule("@/middleware/security/csrf.js", () => ({
    csrfGenerateMiddleware: (_req: Request, _res: Response, next: NextFunction) => next(),
    csrfVerifyMiddleware: (_req: Request, _res: Response, next: NextFunction) => next(),
}));
jest.unstable_mockModule("@/config/logger.js", () => ({
    logger: { info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

const { createApp } = await import("@/app.js");
const { prisma } = await import("@/config/db.js");

const app = createApp();
const fixture = path.join(process.cwd(), "tests", "fixtures", "test.jpg");

describe("CRUD Produits", () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  beforeEach(async () => {
    await prisma.product.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("créer, lister, récuperer, modifier, supprimer", async () => {
    const createRes = await request(app)
      .post("/api/v1/products")
      .field("label", "Lampe Céramique Sable")
      .field("description", "Lampe artisanale à lumière douce")
      .field("category", "Luminaires")
      .field("price", "89.90")
      .attach("images", fixture);

    expect(createRes.status).toBe(201);
    expect(createRes.body.label).toBe("Lampe Céramique Sable");
    expect(createRes.body.images.length).toBeGreaterThan(0);

    const id = createRes.body.id;

    const listRes = await request(app).get("/api/v1/products");
    expect(listRes.status).toBe(200);
    expect(listRes.body.length).toBe(1);

    const getRes = await request(app).get(`/api/v1/products/${id}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.id).toBe(id);

    const updateRes = await request(app)
      .put(`/api/v1/products/${id}`)
      .field("label", "Lampe Céramique Sable - Édition limitée")
      .field("price", "99.90")
      .attach("images", fixture);

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.label).toContain("Édition limitée");

    const deleteRes = await request(app).delete(`/api/v1/products/${id}`);
    expect(deleteRes.status).toBe(204);

    const afterDelete = await request(app).get(`/api/v1/products/${id}`);
    expect(afterDelete.status).toBe(404);
  });
});
