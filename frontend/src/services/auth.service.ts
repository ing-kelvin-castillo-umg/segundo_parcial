import { AuthResponseDto, UserResponseDto } from "@/dtos/auth.dto";
import { AuthSession, User } from "@/entities/user.entity";
import { AuthMapper } from "@/mappers/auth.mapper";
import { ApiClient } from "./api.client";

export class AuthService {
  static async login(credentials: { username: string; password: string }): Promise<AuthSession> {
    const dto = AuthMapper.toLoginDto(credentials);
    const response = await ApiClient.post<AuthResponseDto>("/auth/login", dto);
    const session = AuthMapper.toSession(response.data);

    if (typeof window !== "undefined") {
      localStorage.setItem("token", session.token);
      localStorage.setItem("refreshToken", session.refreshToken);
      localStorage.setItem("accessTokenExpiresAt", String(session.accessTokenExpiresAt));
      localStorage.setItem("user", JSON.stringify(session.user));
    }

    return session;
  }

  static async getCurrentUser(): Promise<User> {
    const response = await ApiClient.get<UserResponseDto>("/auth/me");
    return AuthMapper.toUserFromResponse(response.data);
  }

  static clearStoredSession(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("accessTokenExpiresAt");
    localStorage.removeItem("user");
  }

  static async logout(): Promise<void> {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 3000);
    try {
      if (refreshToken) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ refreshToken }),
          cache: "no-store",
          signal: controller.signal,
        });
      }
    } finally {
      window.clearTimeout(timeout);
      this.clearStoredSession();
    }
  }

  static getStoredSession(): AuthSession | null {
    if (typeof window === "undefined") return null;

    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");
    const accessTokenExpiresAt = Number(localStorage.getItem("accessTokenExpiresAt"));
    const userStr = localStorage.getItem("user");

    if (!token || !refreshToken || !accessTokenExpiresAt || !userStr) {
      this.clearStoredSession();
      return null;
    }

    try {
      const user = JSON.parse(userStr) as User;
      return {
        token,
        refreshToken,
        accessTokenExpiresAt,
        user,
        isAuthenticated: true,
        isAdmin: user.roles?.includes("ROLE_ADMIN") || false,
      };
    } catch {
      return null;
    }
  }
}
