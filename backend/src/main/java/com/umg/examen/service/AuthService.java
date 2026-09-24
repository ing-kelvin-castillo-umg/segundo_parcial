package com.umg.examen.service;

import com.umg.examen.dto.request.LoginRequest;
import com.umg.examen.dto.request.LogoutRequest;
import com.umg.examen.dto.request.RefreshTokenRequest;
import com.umg.examen.dto.response.AuthResponse;
import com.umg.examen.dto.response.UserResponse;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    AuthResponse refreshToken(RefreshTokenRequest request);
    void logout(String authorizationHeader, LogoutRequest request);
    UserResponse getCurrentUser(String username);
}
