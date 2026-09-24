import { AuthResponseDto, UserResponseDto } from "@/dtos/auth.dto";
import { AuthSession, User } from "@/entities/user.entity";
import { AuthMapper } from "@/mappers/auth.mapper";
import { ApiClient } from "./api.client";

export class AuthService {
  static async login(credentials: { username: string; password: string }): Promise<AuthSession> {
    const dto = AuthMapper.toLoginDto(credentials);
    const response = await ApiClient.post<AuthResponseDto>("/api/auth/login", dto);
    return AuthMapper.toSession(response.data);
  }

  static async getCurrentUser(): Promise<User> {
    const response = await ApiClient.get<UserResponseDto>("/api/auth/me");
    return AuthMapper.toUserFromResponse(response.data);
  }

  static async logout(): Promise<void> {
    await ApiClient.post<void>("/api/auth/logout");
  }
}
