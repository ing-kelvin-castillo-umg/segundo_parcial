package com.umg.examen.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.umg.examen.dto.request.LoginRequest;
import com.umg.examen.dto.request.RefreshTokenRequest;
import com.umg.examen.dto.response.ApiResponse;
import com.umg.examen.dto.response.AuthResponse;
import com.umg.examen.dto.response.RefreshTokenResponse;
import com.umg.examen.dto.response.UserResponse;
import com.umg.examen.service.AuthService;
import com.umg.examen.service.impl.AuthServiceImpl;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Autenticación", description = "Endpoints para inicio de sesión y gestión de sesión de usuario")
public class AuthController {

    private final AuthService authService;
    private final AuthServiceImpl authServiceImpl;

    public AuthController(AuthService authService, AuthServiceImpl authServiceImpl) {
        this.authService = authService;
        this.authServiceImpl = authServiceImpl;
    }

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión", description = "Autentica al usuario con username y password, retornando un token JWT y sus roles asignados")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse authResponse = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Inicio de sesión exitoso", authResponse));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Renovar token de acceso", description = "Genera un nuevo token de acceso usando un refresh token válido")
    public ResponseEntity<ApiResponse<RefreshTokenResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        try {
            RefreshTokenResponse response = authServiceImpl.refreshToken(request);
            return ResponseEntity.ok(ApiResponse.success("Token renovado exitosamente", response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/logout")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Cerrar sesión", description = "Revoca el refresh token del usuario actual")
    public ResponseEntity<ApiResponse<String>> logout(@RequestBody RefreshTokenRequest request) {
        try {
            authServiceImpl.logout(request.getRefreshToken());
            return ResponseEntity.ok(ApiResponse.success("Sesión cerrada correctamente", null));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ApiResponse.error("Error al cerrar sesión: " + e.getMessage()));
        }
    }

    @GetMapping("/me")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Obtener usuario actual", description = "Retorna los datos del usuario autenticado a través del token JWT")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(ApiResponse.error("No autenticado"));
        }
        UserResponse user = authService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Perfil de usuario obtenido", user));
    }
}
