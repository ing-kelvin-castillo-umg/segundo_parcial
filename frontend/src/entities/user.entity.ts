export type UserRole = 'ROLE_ADMIN' | 'ROLE_USER';

export interface User {
  id?: number;
  username: string;
  fullName: string;
  email?: string;
  roles: UserRole[];
  enabled?: boolean;
}

export interface AuthSession {
  token: string;
  /** Momento (epoch en ms) en que expira el access token. */
  expiresAt: number;
  user: User;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

/** Motivo del cierre de sesión que se envía al backend. */
export type LogoutReason = 'INACTIVITY' | 'MANUAL';
