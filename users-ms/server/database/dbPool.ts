import { Pool } from "pg";

const dbPool = new Pool({
    host: "db",
    database: "users_db",
    user: "root",
    password: "password",
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

export default dbPool;
