import { AuthResponseDto, UserResponseDto } from "@/dtos/auth.dto";
import { AuthSession, User } from "@/entities/user.entity";
import { AuthMapper } from "@/mappers/auth.mapper";
import { ApiClient } from "./api.client";

export class AuthService {
  static async login(credentials: { username: string; password: string }): Promise<AuthSession> {
    const dto = AuthMapper.toLoginDto(credentials);
    const response = await ApiClient.post<AuthResponseDto>("/api/auth/login", dto);
    const session = AuthMapper.toSession(response.data);
    ApiClient.persistAuthResponse(response.data);

    return session;
  }

  static async refreshSession(): Promise<AuthSession> {
    const response = await ApiClient.refreshSession();
    const session = AuthMapper.toSession(response);
    ApiClient.persistAuthResponse(response);
    return session;
  }

  static async getCurrentUser(): Promise<User> {
    const response = await ApiClient.get<UserResponseDto>("/api/auth/me");
    return AuthMapper.toUserFromResponse(response.data);
  }

  static logout(): void {
    ApiClient.clearStoredSession();
  }

  static getStoredSession(): AuthSession | null {
    if (typeof window === "undefined") return null;

    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");
    const expiresAt = Number(localStorage.getItem("accessTokenExpiresAt"));
    const userStr = localStorage.getItem("user");

    if (!token || !refreshToken || !expiresAt || !userStr) return null;

    try {
      const user = JSON.parse(userStr) as User;
      return {
        token,
        refreshToken,
        accessTokenExpiresAt: expiresAt,
        user,
        isAuthenticated: true,
        isAdmin: user.roles?.includes("ROLE_ADMIN") || false,
      };
    } catch {
      return null;
    }
  }
}
