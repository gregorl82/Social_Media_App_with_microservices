import { Request, Response, NextFunction } from "express";

import dbPool from "../../database/dbPool";
import User from "../../models/User";
import hashPassword from "../../utils/hashPassword";

const getAllUsers = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
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
};

const createUser = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const { email, password } = req.body;

        const existingUserResults = await dbPool.query<User>(
            "SELECT * from users where email = $1",
            [email],
        );
        if (existingUserResults.rowCount > 0) {
            throw new Error("User with email address already exists!");
        }

        const result = await dbPool.query<User>(
            "INSERT into users(email) VALUES ($1) RETURNING *",
            [email],
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
        next();
    } catch (error) {
        console.log(error);
        res.status(500).json({ error, message: "An error occured" });
    }
};

const getUser = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const { id } = req.params;
        const result = await dbPool.query("SELECT * from users WHERE id = $1", [
            id,
        ]);
        const user = result.rows[0];
        res.status(200).json({ user });
        next();
    } catch (error) {
        console.log(error);
        res.status(500).json({ error, message: "An error occured" });
    }
};

export { getAllUsers, createUser, getUser };
