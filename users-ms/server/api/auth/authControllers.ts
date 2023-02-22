import { Request, Response } from "express";
import Jwt from "jsonwebtoken";

import dbPool from "../../database/dbPool";
import checkPassword from "../../utils/checkPassword";

const TOKEN_EXPIRY = 60 * 15;

const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        const result = await dbPool.query("SELECT * FROM users WHERE email = $1", [email]);
        const user = result.rows[0];
        if (!user) {
            res.status(401).json({
                message: "Login unsuccessful",
            });
            return;
        }
        const passwordResult = await dbPool.query("SELECT * FROM user_passwords WHERE user_id = $1", [user.id]);
        const dbPassword = passwordResult.rows[0];
        const passwordsMatch = await checkPassword(password, dbPassword.password);
        if (!passwordsMatch) {
            res.status(401).json({
                message: "Login unsuccessful",
            });
            return;
        }

        const tokenBody = { userUuid: user.uuid };
        const token = Jwt.sign(tokenBody, "secret", { expiresIn: TOKEN_EXPIRY });

        await dbPool.query("INSERT INTO tokens(user_id, token) VALUES ($1, $2)", [user.id, token]);
        res.status(200).set("Authorization", token).json({ message: "You have logged in!" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error, message: "An error occured" });
    }
};

const logout = async (req: Request, res: Response): Promise<void> => {
    try {
        res.status(200).json({ message: "You have logged out!" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error, message: "An error occured" });
    }
};

export { login, logout };
