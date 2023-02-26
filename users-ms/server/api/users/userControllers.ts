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
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};

const createUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        const { uuid } = await userService.createUser(email);
        await passwordService.storePassword(uuid, password);
        res.status(201).json({
            message: `Created user with uuid ${uuid}`,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};

const getUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const user = await userService.getUserById(id);
        res.status(200).json({ user });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};

const updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { firstName, lastName } = req.body;
        const updatedUser = await userService.updateUserName(id, firstName, lastName);
        res.status(200).json({ update: updatedUser });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
};

export { getAllUsers, createUser, getUser, updateUser };
