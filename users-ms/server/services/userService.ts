import { Database, UsersDbTable } from "../database/dbPool";
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

    async getUserByEmail(email: string): Promise<User> {
        const result = await this.db.findOne<User>(UsersDbTable.USERS, { email });
        const user = this.mapDbResultToUser(result);
        return user;
    }

    async getUserById(id: string): Promise<User> {
        const result = await this.db.findOne<User>(UsersDbTable.USERS, { id });
        const user = this.mapDbResultToUser(result);
        return user;
    }
}

export default UserService;
