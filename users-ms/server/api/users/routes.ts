import express from "express";
import { createUser, getAllUsers, getUser } from "./userControllers";

const userRouter = express.Router();

userRouter.get("/", getAllUsers);
userRouter.post("/", createUser);
userRouter.get("/:id", getUser);

export default userRouter;
