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

enum UsersDbTable {
    USERS = "users",
    TOKENS = "tokens",
    PASSWORDS = "user_passwords",
}

class Database {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async findOne<T extends object>(tableName: string, data: Record<string, any>): Promise<T> {
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

    async findMany<T extends object>(tableName: string, data?: Record<string, any>): Promise<T[]> {
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

    async insert<T extends object>(tableName: string, data: Record<string, any>): Promise<T> {
        const columns = Object.keys(data).join(",");
        const values = Object.values(data);

        const insertValuePlaceholders = values
            .map((_, index) => {
                return `$${index + 1}`;
            })
            .join(",");

        const query = `INSERT INTO ${tableName} (${columns}) VALUES (${insertValuePlaceholders}) RETURNING *`;

        const result = await this.pool.query(query, values);
        return result.rows[0] as T;
    }

    async delete(tableName: string, data: Record<string, any>): Promise<string> {
        const columns = Object.keys(data);
        const numberOfColumns = columns.length;
        const values = Object.values(data);
        let clauses = "";

        columns.map((column, index) => {
            clauses += `${column} = $${index + 1}`;
            if (index + 1 < numberOfColumns) {
                clauses += " AND ";
            }
        });

        const query = `DELETE FROM ${tableName} WHERE ${clauses} RETURNING id`;
        const result = await this.pool.query(query, values);

        return `Successfully removed entity with id ${result.rows[0]}`;
    }

    async close(): Promise<void> {
        await this.pool.end();
    }
}

export { dbPool, Database, UsersDbTable };
