export enum TokenType {
    ACCESS = "ACCESS",
    REFRESH = "REFRESH",
}

export interface Token {
    userId: string;
    token: string;
    type: TokenType;
    creationDate: string;
}
