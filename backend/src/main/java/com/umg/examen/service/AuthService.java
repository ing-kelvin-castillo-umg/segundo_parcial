package com.umg.examen.service;

import com.umg.examen.dto.request.LoginRequest;
import com.umg.examen.dto.response.AuthResponse;
import com.umg.examen.dto.response.UserResponse;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    UserResponse getCurrentUser(String username);

    /** Rota el refresh token y emite un nuevo access token. */
    AuthResponse refresh(String refreshToken);

    /** Revoca la sesión asociada al refresh token. */
    void logout(String refreshToken);
}
