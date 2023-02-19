import { Request, Response } from "express";

import app from "./App";

const PORT = 8000;

app.get("/", (req: Request, res: Response) => {
    res.send("Hello world");
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
