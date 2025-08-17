export interface IUserDb {
  username: string;
  email: string;
  password: string; // hashed!
  role: 'admin' | 'editor' | 'user';
}
