import { Database, UsersDbTable } from "../database/dbPool";
import { Token, TokenType } from "../models/Token";

class TokenService {
    private db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    async insertToken(userId: string, token: string, type: TokenType): Promise<void> {
        await this.db.insert<Token>(UsersDbTable.TOKENS, { user_id: userId, token, type });
    }
}

export default TokenService;
