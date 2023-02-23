/* eslint-disable @typescript-eslint/no-explicit-any */
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

class Database {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async findOne<T extends object>(tableName: string, data: Record<string, unknown>): Promise<T> {
        const columns = Object.keys(data);
        const values = Object.values(data);
        const numberOfColumns = columns.length;

        const clauses = columns
            .map((column, index) => {
                const clause = `${column} = $${index + 1}`;
                if (index < numberOfColumns - 1) {
                    return clause + " AND ";
                }
                return clause;
            })
            .join("");

        const query = `SELECT * FROM ${tableName} WHERE ${clauses}`;
        const result = await this.pool.query(query, values);
        return result.rows[0] as T;
    }

    async findMany<T extends object>(tableName: string, data?: Record<string, unknown>): Promise<T[]> {
        const values = [];
        let clauses = "";

        if (data) {
            clauses += " WHERE ";
            const columns = Object.keys(data);
            const numberOfColumns = columns.length;
            values.push(...Object.values(data));

            columns.map((column, index) => {
                const clause = `${column} = $${index + 1}`;
                if (index < numberOfColumns - 1) {
                    return (clauses += `${clause} AND `);
                }
                return (clauses += clause);
            });
        }

        const query = `SELECT * FROM ${tableName}${clauses}`;
        const result = await this.pool.query(query, values);
        return result.rows as T[];
    }

    async insert<T extends object>(tableName: string, data: Record<string, unknown>): Promise<T> {
        const columns = Object.keys(data).join(",");
        const values = Object.values(data);

        const setValues = values
            .map((_, index) => {
                return `$${index + 1}`;
            })
            .join(",");

        const query = `INSERT INTO ${tableName} (${columns}) VALUES (${setValues}) RETURNING *`;

        const result = await this.pool.query(query, values);
        return result.rows[0] as T;
    }

    async close(): Promise<void> {
        await this.pool.end();
    }
}

export { dbPool, Database };
