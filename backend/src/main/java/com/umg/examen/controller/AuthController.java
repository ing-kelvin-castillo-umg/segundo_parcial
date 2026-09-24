package com.umg.examen.controller;

import com.umg.examen.dto.request.LoginRequest;
import com.umg.examen.dto.response.ApiResponse;
import com.umg.examen.dto.response.AuthResponse;
import com.umg.examen.dto.response.UserResponse;
import com.umg.examen.service.AuthService;
import com.umg.examen.security.JwtTokenProvider;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Autenticación", description = "Endpoints para inicio de sesión y gestión de sesión de usuario")
public class AuthController {

    private final AuthService authService;
    private final JwtTokenProvider tokenProvider;

    public AuthController(AuthService authService, JwtTokenProvider tokenProvider) {
        this.authService = authService;
        this.tokenProvider = tokenProvider;
    }

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión", description = "Autentica al usuario con username y password, retornando un token JWT y sus roles asignados")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthService.LoginResult result = authService.login(request);
        ResponseCookie refreshCookie = createRefreshCookie(result.refreshToken());
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(ApiResponse.success("Inicio de sesión exitoso", result.response()));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Renovar token de acceso", description = "Genera un access token nuevo usando la cookie HttpOnly de refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
            @CookieValue(name = "refresh_token", required = false) String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.status(401).body(ApiResponse.error("Refresh token no proporcionado"));
        }

        AuthResponse authResponse = authService.refreshAccessToken(refreshToken);
        return ResponseEntity.ok(ApiResponse.success("Token de acceso renovado", authResponse));
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

    private ResponseCookie createRefreshCookie(String refreshToken) {
        return ResponseCookie.from("refresh_token", refreshToken)
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/api/auth")
                .maxAge(tokenProvider.getRefreshExpirationMs() / 1000)
                .build();
    }
}
