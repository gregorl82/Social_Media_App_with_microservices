import express from "express";
import {
    createUser,
    getAllUsers,
    getUser,
    updateUser,
} from "./userControllers";

const userRouter = express.Router();

userRouter.get("/", getAllUsers);
userRouter.post("/", createUser);
userRouter.get("/:id", getUser);
userRouter.put("/:id", updateUser);

export default userRouter;
