import { Client } from "pg";

const dbClient = new Client({
    user: "root",
    host: "db",
    database: "users_ms",
    password: "password",
    port: 5432,
});

export default dbClient;
