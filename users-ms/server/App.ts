import bodyParser from "body-parser";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

import dbPool from "./database/dbPool";
import User from "./models/User";
import hashPassword from "./utils/hashPassword";

const app = express();

const swaggerDocument = YAML.load("./swagger.yaml");

app.use(bodyParser.json());
app.use(helmet());
app.use(morgan("dev"));
app.use(cors());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/", (req: Request, res: Response, next: NextFunction) => {
    res.send("Hello world");
    next();
});

app.get("/users", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const queryResult = await dbPool.query("SELECT * FROM users");
        const results = queryResult.rows;

        const users: User[] = results.map((result) => {
            return {
                firstName: result.first_name,
                lastName: result.last_name,
                email: result.email,
                uuid: result.uuid,
            };
        });

        res.status(200).json({ users });
        next();
    } catch (error) {
        console.log(error);
        res.status(500).json({ error, message: "An error occurred!" });
    }
});

app.post("/users", async (req: Request, res: Response) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        const existingUserResults = await dbPool.query<User>(
            "SELECT * from users where email = $1",
            [email],
        );
        if (existingUserResults.rowCount > 0) {
            throw new Error("User with email address already exists!");
        }

        const result = await dbPool.query<User>(
            "INSERT into users(first_name, last_name, email) VALUES ($1, $2, $3) RETURNING *",
            [firstName, lastName, email],
        );
        const { id, uuid } = result.rows[0];

        const hashedPassword = await hashPassword(password);
        await dbPool.query(
            "INSERT into user_passwords(user_id, password) VALUES ($1, $2)",
            [id, hashedPassword],
        );

        res.status(201).json({
            message: `Created user with uuid ${uuid}`,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error, message: "An error occured" });
    }
});

app.get("/users/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await dbPool.query("SELECT * from users WHERE id = $1", [
            id,
        ]);
        const user = result.rows[0];
        res.status(200).json({ user });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error, message: "An error occured" });
    }
});

export default app;
