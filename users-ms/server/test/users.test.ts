import request from "supertest";
import dbPool from "../database/dbPool";
import app from "../App";

describe("Example test", () => {
    it("should return a 200 status code", async () => {
        const res = await request(app).get("/users");
        expect(res.status).toBe(200);
    });

    afterAll(async () => {
        await dbPool.end();
    });
});
