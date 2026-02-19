import request from "supertest";
import { createApp } from "@/app.js";
import { prisma } from "@/config/db.js";
import path from "node:path";

const app = createApp();
const fixture = path.join(process.cwd(), "tests", "fixtures", "test.jpg");

describe("Products CRUD", () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  beforeEach(async () => {
    await prisma.product.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("create, list, get, update, delete", async () => {
    const createRes = await request(app)
      .post("/api/products")
      .field("label", "Lampe C�ramique Sable")
      .field("description", "Lampe artisanale � lumi�re douce")
      .field("category", "Luminaires")
      .field("price", "89.90")
      .attach("images", fixture);

    expect(createRes.status).toBe(201);
    expect(createRes.body.label).toBe("Lampe C�ramique Sable");
    expect(createRes.body.images.length).toBeGreaterThan(0);

    const id = createRes.body.id;

    const listRes = await request(app).get("/api/products");
    expect(listRes.status).toBe(200);
    expect(listRes.body.length).toBe(1);

    const getRes = await request(app).get(`/api/products/${id}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.id).toBe(id);

    const updateRes = await request(app)
      .put(`/api/products/${id}`)
      .field("label", "Lampe C�ramique Sable - �dition limit�e")
      .field("price", "99.90")
      .attach("images", fixture);

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.label).toContain("�dition limit�e");

    const deleteRes = await request(app).delete(`/api/products/${id}`);
    expect(deleteRes.status).toBe(204);

    const afterDelete = await request(app).get(`/api/products/${id}`);
    expect(afterDelete.status).toBe(404);
  });
});
