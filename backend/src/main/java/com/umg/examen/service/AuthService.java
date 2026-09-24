package com.umg.examen.service;

import com.umg.examen.dto.request.LoginRequest;
import com.umg.examen.dto.response.AuthResponse;
import com.umg.examen.dto.response.TokenRefreshResponse;
import com.umg.examen.dto.response.UserResponse;

public interface AuthService {

    AuthResponse login(LoginRequest request);

    UserResponse getCurrentUser(String username);

    /** Renueva el access token a partir de un refresh token vigente, rotándolo. */
    TokenRefreshResponse refresh(String refreshToken);

    /**
     * Cierra la sesión del lado del servidor: revoca el refresh token e inscribe el
     * access token en la lista de revocación para que deje de ser aceptado.
     */
    void logout(String accessToken, String refreshToken, String reason);
}
