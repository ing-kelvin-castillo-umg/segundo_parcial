export interface LoginRequestDto {
  username: string;
  password: string;
}

/**
 * Respuesta de /api/auth/login y /api/auth/refresh tal como la entrega el BFF.
 * El refreshToken nunca llega al navegador: el BFF lo guarda en una cookie httpOnly.
 */
export interface AuthResponseDto {
  accessToken: string;
  tokenType: string;
  /** Segundos de vida del access token. */
  expiresIn: number;
  username: string;
  fullName: string;
  email: string;
  roles: string[];
}

export interface UserResponseDto {
  id: number;
  username: string;
  fullName: string;
  email: string;
  enabled: boolean;
  roles: string[];
  createdAt: string;
}

export interface ApiResponseDto<T> {
  success: boolean;
  message: string;
  data: T;
}
