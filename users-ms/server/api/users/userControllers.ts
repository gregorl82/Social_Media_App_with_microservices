import { Request, Response } from "express";

import { dbPool, Database } from "../../database/database";

import PasswordService from "../../services/passwordService";
import UserService from "../../services/userService";

const db = new Database(dbPool);
const userService = new UserService(db);
const passwordService = new PasswordService(db);

const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await userService.getAllUsers();
        res.status(200).json({ users });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error, message: "An error occurred!" });
    }
};

const createUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        const existingUser = await userService.getUserByEmail(email);
        if (existingUser) {
            throw new Error("User with email address already exists!");
        }
        const { uuid } = await userService.createUser(email);
        await passwordService.storePassword(uuid, password);
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
        const user = await userService.getUserById(id);
        res.status(200).json({ user });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error, message: "An error occured" });
    }
};

const updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const existingUser = await userService.getUserById(id);
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
