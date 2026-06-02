// features/auth/types.ts
export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isAdmin: boolean;
}

export interface AuthResult {
  user: AuthUser;
}
