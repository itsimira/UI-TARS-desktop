import { User } from './user';

export interface LoginResponse {
  token: string;
  user: User;
}

export interface SignUpResponse {
  token: string;
  user: User;
}

export interface ValidateResponse {
  valid: boolean;
  user: User | null;
}
