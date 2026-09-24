export interface LoginRequestDto {
  username: string;
  password: string;
}

export interface AuthResponseDto {
  token: string;
  refreshToken: string;
  expiresIn: number;
  type: string;
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
