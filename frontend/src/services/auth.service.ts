import { AuthResponseDto, UserResponseDto } from "@/dtos/auth.dto";
import { AuthSession, User } from "@/entities/user.entity";
import { AuthMapper } from "@/mappers/auth.mapper";
import { ApiClient } from "./api.client";

// Solo se guarda el perfil público del usuario (para pintar la UI y saber si había sesión).
// Los tokens viven en cookies httpOnly del BFF y nunca se escriben en localStorage.
const USER_STORAGE_KEY = "user";

export class AuthService {
  static async login(credentials: { username: string; password: string }): Promise<AuthSession> {
    const dto = AuthMapper.toLoginDto(credentials);
    const response = await ApiClient.post<AuthResponseDto>("/api/auth/login", dto);
    const session = AuthMapper.toSession(response.data);

    if (typeof window !== "undefined") {
      localStorage.removeItem("token"); // restos de la versión anterior (token en localStorage)
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(session.user));
    }

    return session;
  }

  static async getCurrentUser(): Promise<User> {
    const response = await ApiClient.get<UserResponseDto>("/api/auth/me");
    return AuthMapper.toUserFromResponse(response.data);
  }

  static async logout(): Promise<void> {
    try {
      await ApiClient.post<null>("/api/auth/logout", {});
    } finally {
      this.clearLocalSession();
    }
  }

  static clearLocalSession(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }

  static getStoredUser(): User | null {
    if (typeof window === "undefined") return null;

    const userStr = localStorage.getItem(USER_STORAGE_KEY);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  }
}
