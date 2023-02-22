import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

import userRouter from "./api/users/routes";

const app = express();

const swaggerDocument = YAML.load("./swagger.yaml");

app.use(bodyParser.json());
app.use(helmet());
app.use(morgan("dev"));
app.use(cors());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/users", userRouter);

export default app;
