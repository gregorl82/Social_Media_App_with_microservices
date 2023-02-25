import { Request, Response } from "express";
import jwt from "jsonwebtoken";

import { Database, dbPool } from "../../database/database";

import Password from "../../models/Password";
import { TokenType } from "../../models/Token";
import User from "../../models/User";

import checkPassword from "../../utils/checkPassword";

const TOKEN_EXPIRY = 60 * 15;

const login = async (req: Request, res: Response): Promise<void> => {
    const db = new Database(dbPool);

    try {
        const { email, password } = req.body;
        const user = await db.findOne<User>("users", { email });
        if (!user) {
            res.status(401).json({
                message: "Login unsuccessful",
            });
            return;
        }
        const dbPassword = await db.findOne<Password>("user_passwords", { user_id: user.id });
        const passwordsMatch = await checkPassword(password, dbPassword.password);
        if (!passwordsMatch) {
            res.status(401).json({
                message: "Login unsuccessful",
            });
            return;
        }

        const tokenBody = { userUuid: user.uuid };
        const accessToken = jwt.sign(tokenBody, "secret", { expiresIn: TOKEN_EXPIRY });

        await db.insert("tokens", { user_id: user.id, token: accessToken, type: TokenType.ACCESS });

        res.status(200).set("Authorization", accessToken).json({ message: "You have logged in!" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error, message: "An error occured" });
    }
};

const logout = async (req: Request, res: Response): Promise<void> => {
    try {
        const token = req.headers["authorization"];
        if (!token) {
            res.status(400).json({ message: "Token is missing from header" });
            return;
        }
        const { userUuid } = jwt.decode(token) as { userUuid: string };

        const userQuery = await dbPool.query("SELECT id FROM users where uuid = $1", [userUuid]);
        const user = userQuery.rows[0];

        await dbPool.query("DELETE FROM tokens WHERE user_id = $1", [user.id]);
        res.status(200).json({ message: "You have logged out!" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error, message: "An error occured" });
    }
};

export { login, logout };
