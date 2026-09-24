export interface LoginRequestDto {
  username: string;
  password: string;
}

export interface AuthResponseDto {
  token: string;
  type: string;
  /** Vigencia del access token en segundos. El refresh token nunca llega al JS: viaja en una cookie httpOnly. */
  expiresIn?: number;
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
