package com.umg.examen.service;

import com.umg.examen.dto.request.LoginRequest;
import com.umg.examen.dto.response.AuthResponse;
import com.umg.examen.dto.response.UserResponse;

public interface AuthService {
    record LoginResult(AuthResponse response, String refreshToken) {}

    LoginResult login(LoginRequest request);
    AuthResponse refreshAccessToken(String refreshToken);
    UserResponse getCurrentUser(String username);
}
