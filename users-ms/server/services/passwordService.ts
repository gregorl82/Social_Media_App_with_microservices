import { Database, UsersDbTable } from "../database/dbPool";
import Password from "../models/Password";

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

    async insertPassword(userId: string, userPassword: string): Promise<void> {
        await this.db.insert<Password>(UsersDbTable.PASSWORDS, { user_id: userId, password: userPassword });
    }
}

export default PasswordService;
