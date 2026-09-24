import { ApiResponseDto } from "@/dtos/auth.dto";

export class ApiClient {
  private static getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  }

  static async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponseDto<T>> {
    const url = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const token = this.getToken();

    const headers = new Headers(options.headers);
    headers.set("Accept", "application/json");
    if (options.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });
    const responseText = await response.text();
    let data: unknown = null;

    if (responseText) {
      try {
        data = JSON.parse(responseText) as unknown;
      } catch {
        data = null;
      }
    }

    if (!response.ok) {
      const errorMessage =
        typeof data === "object" && data !== null && "message" in data && typeof data.message === "string"
          ? data.message
          : `Error HTTP ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    if (!responseText) {
      return { success: true, message: "", data: undefined as T };
    }

    return data as ApiResponseDto<T>;
  }

  static get<T>(endpoint: string): Promise<ApiResponseDto<T>> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  static post<T>(endpoint: string, body: unknown): Promise<ApiResponseDto<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  static put<T>(endpoint: string, body: unknown): Promise<ApiResponseDto<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  static delete<T>(endpoint: string): Promise<ApiResponseDto<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}
