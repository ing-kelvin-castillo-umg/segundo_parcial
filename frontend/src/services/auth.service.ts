import { AuthResponseDto, UserResponseDto } from "@/dtos/auth.dto";
import { AuthSession, User } from "@/entities/user.entity";
import { AuthMapper } from "@/mappers/auth.mapper";
import { ApiClient } from "./api.client";
import { SessionStore } from "./session.store";

export class AuthService {
  static async login(credentials: { username: string; password: string }): Promise<AuthSession> {
    const dto = AuthMapper.toLoginDto(credentials);
    const response = await ApiClient.post<AuthResponseDto>("/api/auth/login", dto);
    const session = AuthMapper.toSession(response.data);

    SessionStore.save(session);
    console.info(`[Auth] Sesión iniciada, access token expira en ${response.data.expiresIn}s`);

    return session;
  }

  /** Renueva el access token con el refresh token de la cookie httpOnly (single-flight). */
  static refresh(): Promise<AuthSession> {
    return ApiClient.refreshSession();
  }

  static async getCurrentUser(): Promise<User> {
    const response = await ApiClient.get<UserResponseDto>("/api/auth/me");
    return AuthMapper.toUserFromResponse(response.data);
  }

  static logout(): void {
    SessionStore.clear();
  }

  static getStoredSession(): AuthSession | null {
    return SessionStore.getSession();
  }

  static subscribe(listener: (session: AuthSession | null) => void): () => void {
    return SessionStore.subscribe(listener);
  }
}
