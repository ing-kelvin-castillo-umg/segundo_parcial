export interface LoginRequestDto {
  username: string;
  password: string;
}

export interface AuthResponseDto {
  token: string;
  type: string;
  username: string;
  fullName: string;
  email: string;
  roles: string[];
  // Vigencia del access token. El refreshToken no aparece aquí de forma
  // intencional: nunca llega al navegador, viaja en una cookie httpOnly.
  expiresInMs?: number;
}

export interface TokenRefreshResponseDto {
  token: string;
  type: string;
  expiresInMs?: number;
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
