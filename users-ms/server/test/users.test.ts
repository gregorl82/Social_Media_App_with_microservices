import request from "supertest";
import app from "../App";
import dbPool from "../database/dbPool";
import User from "../models/User";

const application = request(app);
const token = "";

describe("Users", () => {
    describe("GET /users", () => {
        it.skip("should return a 401 status code if a token is missing from request headers", async () => {
            const res = await application.get("/users");
            expect(res.status).toBe(401);
        });

        it.skip("should return a 200 if request is successful", async () => {
            const res = await application.get("/users").set("Authorization", `Bearer ${token}`);
            expect(res.status).toBe(200);
        });

        it.skip("should return an array of users if request is successful", async () => {
            const res = await application.get("/users").set("Authorization", `Bearer ${token}`);

            expect(res.body).toHaveLength(1);
        });
    });

    describe("POST /users", () => {
        it.skip("should return a 201 status code when a user is created", async () => {
            const userRequestBody = {
                email: "test@test.com",
                password: "Testing123!",
            };

            const res = await application
                .post("/users")
                .send(userRequestBody)
                .set("Authorization", `Bearer ${token}`)
                .set("Accept", "application/json");

            expect(res.status).toBe(201);
        });

        it.skip("should return a 401 status code if a token is missing from request headers", async () => {
            const userRequestBody: User = {
                firstName: "Tester",
                lastName: "McTesterson",
                email: "test@test.com",
            };

            const res = await application.post("/users").send(userRequestBody).set("Accept", "application/json");

            expect(res.status).toBe(401);
        });

        it.skip("should return a 400 status code if the user email is missing from request body", async () => {
            const userRequestBody = {
                password: "Testing123!",
            };

            const res = await application.post("/users").send(userRequestBody).set("Accept", "application/json");

            expect(res.status).toBe(400);
        });

        it.skip("should return a 400 status code if the user password is missing from request body", async () => {
            const userRequestBody = {
                email: "test@test.com",
            };

            const res = await application.post("/users").send(userRequestBody).set("Accept", "application/json");

            expect(res.status).toBe(400);
        });
    });

    afterAll(async () => {
        await dbPool.end();
    });
});
