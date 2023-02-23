import { Request, Response } from "express";

import { dbPool, Database } from "../../database/dbPool";
import User from "../../models/User";
import hashPassword from "../../utils/hashPassword";

const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    const db = new Database(dbPool);

    try {
        const results = await db.findMany<{
            id: number;
            uuid: string;
            first_name: string;
            last_name: string;
            email: string;
            creation_date: string;
            last_modification_date: string;
        }>("users");

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
    const db = new Database(dbPool);

    try {
        const { email, password } = req.body;

        const existingUsers = await db.findMany<User[]>("users", { email });
        if (existingUsers.length > 0) {
            throw new Error("User with email address already exists!");
        }

        const timestamp = new Date();

        const result = await db.insert<User>("users", {
            email,
            creation_date: timestamp,
            last_modification_date: timestamp,
        });

        const { id, uuid } = result;
        const hashedPassword = await hashPassword(password);
        await db.insert("user_passwords", { user_id: id, password: hashedPassword });
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
