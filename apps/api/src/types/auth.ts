export interface AuthUser {
  userId: number;
  email: string;
  tokenType?: 'access' | 'refresh';
  [key: string]: unknown;
}
