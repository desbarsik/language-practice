import { query } from '../config/database';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export const findUserByEmail = async (email: string) => {
  const result = await query<User>('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
};

export const findUserById = async (id: string) => {
  const result = await query<Pick<User, 'id' | 'email' | 'created_at'>>(
    'SELECT id, email, created_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
};

export const createUser = async (email: string, passwordHash: string) => {
  const result = await query<User>(
    'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
    [email, passwordHash]
  );
  return result.rows[0];
};
