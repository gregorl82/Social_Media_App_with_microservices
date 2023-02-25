/* eslint-disable @typescript-eslint/no-explicit-any */
import { Database, UsersDbTable } from "../database/database";
import User from "../models/User";

class UserService {
    private db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    mapDbResultToUser(data: Record<string, any>): User {
        return {
            id: data.id,
            firstName: data.first_name,
            lastName: data.last_name,
            email: data.email,
            uuid: data.uuid,
            creationDate: data.creation_date,
            lastModificationDate: data.last_modification_date,
        };
    }

    async getAllUsers(): Promise<User[]> {
        const results = await this.db.findMany<User>(UsersDbTable.USERS);
        const users = results.map((result) => this.mapDbResultToUser(result));
        return users;
    }

    async getUserByEmail(email: string): Promise<User | undefined> {
        const result = await this.db.findOne<User>(UsersDbTable.USERS, { email });
        if (!result) {
            return undefined;
        }
        const user = this.mapDbResultToUser(result);
        return user;
    }

    async getUserById(id: string): Promise<User> {
        const result = await this.db.findOne<User>(UsersDbTable.USERS, { id });
        const user = this.mapDbResultToUser(result);
        return user;
    }

    async createUser(email: string): Promise<User> {
        const timestamp = new Date();
        const result = await this.db.insert<User>(UsersDbTable.USERS, {
            email,
            creation_date: timestamp,
            last_modification_date: timestamp,
        });
        const user = this.mapDbResultToUser(result);
        return user;
    }
}

export default UserService;
