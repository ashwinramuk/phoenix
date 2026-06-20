import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../../src/app.ts";
import { pool } from "../../src/db/pool.ts";
import { SCHEMA_SQL } from "../../src/db/schema.ts";

// These tests hit PostgreSQL. They run when DATABASE_URL is set (CI provides a
// postgres service + runs migrate/seed); otherwise they're skipped so unit
// tests still run locally without a database.
const suite = process.env.DATABASE_URL ? describe : describe.skip;

suite("API integration", () => {
  beforeAll(async () => {
    await pool.query(SCHEMA_SQL);
  });

  afterAll(async () => {
    // let fire-and-forget audit writes flush before closing the pool
    await new Promise((r) => setTimeout(r, 250));
    await pool.end();
  });

  it("GET /health returns healthy", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("healthy");
  });

  it("returns 404 for unknown routes", async () => {
    const res = await request(app).get("/does-not-exist");
    expect(res.status).toBe(404);
  });

  it("rejects login with an invalid body (400)", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "x@y.com", password: "" });
    expect(res.status).toBe(400);
  });

  it("rejects bad credentials (401)", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "nobody@x.com", password: "wrong" });
    expect(res.status).toBe(401);
  });

  it("GET /api/papers returns a list", async () => {
    const res = await request(app).get("/api/papers");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("blocks the admin audit endpoint without auth (401)", async () => {
    const res = await request(app).get("/api/admin/audit");
    expect(res.status).toBe(401);
  });

  it("rejects an invalid score body (400)", async () => {
    const res = await request(app)
      .post("/api/papers/anything/score")
      .send({ answers: { "1": "Z" } }); // Z is not a valid option
    expect(res.status).toBe(400);
  });
});
