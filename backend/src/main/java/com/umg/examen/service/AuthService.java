package com.umg.examen.service;

import com.umg.examen.dto.request.LoginRequest;
import com.umg.examen.dto.request.LogoutRequest;
import com.umg.examen.dto.request.RefreshTokenRequest;
import com.umg.examen.dto.response.AuthResponse;
import com.umg.examen.dto.response.UserResponse;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    AuthResponse refresh(RefreshTokenRequest request);

    /**
     * Cierra la sesión: revoca el refresh token y, si el access token aún es válido,
     * agrega su jti a la lista negra. Funciona aunque el access token ya haya expirado.
     */
    void logout(LogoutRequest request, String accessToken);
    UserResponse getCurrentUser(String username);
}
