import { Document } from 'mongoose';

export interface User extends Document {
    readonly password: string;
    readonly username: string;
    readonly currentHashedRefreshToken: string;
}