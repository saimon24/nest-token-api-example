export class User {
  password: string;
  username: string;
  currentHashedRefreshToken?: string;
}
