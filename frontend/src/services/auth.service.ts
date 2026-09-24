import { AuthResponseDto, UserResponseDto } from "@/dtos/auth.dto";
import { AuthSession, User } from "@/entities/user.entity";
import { AuthMapper } from "@/mappers/auth.mapper";
import { ApiClient } from "./api.client";

export class AuthService {
  static async login(credentials: { username: string; password: string }): Promise<AuthSession> {
    const dto = AuthMapper.toLoginDto(credentials);
    const response = await ApiClient.post<AuthResponseDto>("/api/auth/login", dto);
    const session = AuthMapper.toSession(response.data);

    if (typeof window !== "undefined") {
      localStorage.setItem("token", session.token);
      localStorage.setItem("refreshToken", session.refreshToken);
      localStorage.setItem("user", JSON.stringify(session.user));
    }

    return session;
  }

  static async getCurrentUser(): Promise<User> {
    const response = await ApiClient.get<UserResponseDto>("/api/auth/me");
    return AuthMapper.toUserFromResponse(response.data);
  }

  static async logout(): Promise<void> {
    const refreshToken = this.getStoredRefreshToken();
    
    if (refreshToken) {
      try {
        await ApiClient.post("/api/auth/logout", { refreshToken });
      } catch (error) {
        console.error("Error revoking refresh token on backend:", error);
        // Continue with logout even if backend request fails
      }
    }

    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
  }

  static getStoredSession(): AuthSession | null {
    if (typeof window === "undefined") return null;

    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) return null;

    try {
      const user = JSON.parse(userStr) as User;
      return {
        token,
        refreshToken: refreshToken || "",
        user,
        isAuthenticated: true,
        isAdmin: user.roles?.includes("ROLE_ADMIN") || false,
      };
    } catch {
      return null;
    }
  }

  private static getStoredRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("refreshToken");
  }
}
