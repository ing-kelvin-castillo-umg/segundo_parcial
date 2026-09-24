export interface LoginRequestDto {
  username: string;
  password: string;
}

// Respuesta de login/refresh del BFF: los tokens quedan en cookies httpOnly y no viajan en el cuerpo.
export interface AuthResponseDto {
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
