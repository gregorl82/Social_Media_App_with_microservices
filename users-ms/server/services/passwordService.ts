import { Database, UsersDbTable } from "../database/database";
import Password from "../models/Password";
import hashPassword from "../utils/hashPassword";

class PasswordService {
    private db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    mapDbResultToPassword(data: Record<string, any>): Password {
        return {
            userId: data.user_id,
            password: data.password,
            creationDate: data.creation_date,
        };
    }

    async getPasswordByUserId(userId: string): Promise<Password> {
        const result = await this.db.findOne<Password>(UsersDbTable.PASSWORDS, { id: userId });
        const password = this.mapDbResultToPassword(result);
        return password;
    }

    async storePassword(userId: number, password: string): Promise<void> {
        const hashedPassword = await hashPassword(password);
        await this.db.insert<Password>(UsersDbTable.PASSWORDS, { user_id: userId, password: hashedPassword });
    }
}

export default PasswordService;
