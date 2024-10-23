import request from "supertest";
import app from "../index";

describe("GET /", () => {
  it('should return a 200 status and "Hello, world!"', async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toEqual(200);
    expect(res.text).toBe("Hello, world!");
  });
});
