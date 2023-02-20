import { Request, Response } from "express";

import app from "./App";
import dbClient from "./database/dbClient";
import User from "./models/User";

const PORT = 8000;

app.get("/", (req: Request, res: Response) => {
    res.send("Hello world");
});

app.get("/users", async (req: Request, res: Response) => {
    try {
        const queryResult = await dbClient.query("SELECT * FROM users");
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
    } catch (error) {
        console.log(error);
        res.status(500).json({ error, message: "An error occurred!" });
    }
});

app.post("/users", async (req: Request, res: Response) => {
    try {
        const { firstName, lastName, email } = req.body;

        const existingUserResults = await dbClient.query<User>(
            "SELECT * from users where email = $1",
            [email],
        );

        if (existingUserResults.rowCount > 0) {
            throw new Error("User with email address already exists!");
        }

        const result = await dbClient.query<User>(
            "INSERT into users(first_name, last_name, email) VALUES ($1, $2, $3) RETURNING *",
            [firstName, lastName, email],
        );

        const { uuid } = result.rows[0];

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
        const result = await dbClient.query(
            "SELECT * from users WHERE id = $1",
            [id],
        );
        const user = result.rows[0];
        res.status(200).json({ user });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error, message: "An error occured" });
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
