export interface JwtPayload {
    id: string;
    username?: string;
    refreshToken?: string;
}