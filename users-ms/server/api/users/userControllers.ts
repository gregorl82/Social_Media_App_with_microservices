import { Request, Response } from "express";

import dbPool from "../../database/dbPool";
import User from "../../models/User";
import hashPassword from "../../utils/hashPassword";

const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const queryResult = await dbPool.query("SELECT * FROM users");
        const results = queryResult.rows;

        const users: User[] = results.map((result) => {
            return {
                id: result.id,
                uuid: result.uuid,
                firstName: result.first_name,
                lastName: result.last_name,
                email: result.email,
                creationDate: result.creation_date,
                lastModificationDate: result.last_modification_date,
            };
        });

        res.status(200).json({ users });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error, message: "An error occurred!" });
    }
};

const createUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        const existingUserResults = await dbPool.query<User>("SELECT * from users where email = $1", [email]);
        if (existingUserResults.rowCount > 0) {
            throw new Error("User with email address already exists!");
        }

        const timestamp = new Date();

        const result = await dbPool.query<User>(
            "INSERT into users(email, creation_date, last_modification_date) VALUES ($1, $2, $2) RETURNING *",
            [email, timestamp],
        );
        const { id, uuid } = result.rows[0];

        const hashedPassword = await hashPassword(password);
        await dbPool.query("INSERT into user_passwords(user_id, password) VALUES ($1, $2)", [id, hashedPassword]);

        res.status(201).json({
            message: `Created user with uuid ${uuid}`,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error, message: "An error occured" });
    }
};

const getUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const result = await dbPool.query("SELECT * from users WHERE id = $1", [id]);
        const user = result.rows[0];
        res.status(200).json({ user });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error, message: "An error occured" });
    }
};

const updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const result = await dbPool.query<User>("SELECT * from users WHERE id = $1", [id]);
        const existingUser = result.rows[0];
        if (!existingUser) {
            res.status(404).json({ message: "User doesn't exist" });
            return;
        }

        const timestamp = new Date();

        const { firstName, lastName } = req.body;
        const updateResult = await dbPool.query(
            "UPDATE users SET first_name = $1, last_name = $2, last_modification_date = $3 WHERE id = $4 RETURNING *",
            [firstName, lastName, timestamp, id],
        );
        const updatedUser = updateResult.rows[0];
        res.status(200).json({ update: updatedUser });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error, message: "An error occured" });
    }
};

export { getAllUsers, createUser, getUser, updateUser };
