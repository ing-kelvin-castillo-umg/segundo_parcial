package com.umg.examen.controller;

import com.umg.examen.dto.request.LoginRequest;
import com.umg.examen.dto.request.LogoutRequest;
import com.umg.examen.dto.request.RefreshTokenRequest;
import com.umg.examen.dto.response.ApiResponse;
import com.umg.examen.dto.response.AuthResponse;
import com.umg.examen.dto.response.UserResponse;
import com.umg.examen.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Autenticación", description = "Endpoints para inicio de sesión y gestión de sesión de usuario")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión",
            description = "Autentica al usuario con username y password. Retorna un access token JWT de corta duración, " +
                    "un refresh token opaco, el tiempo de expiración (expiresIn, en segundos) y los roles asignados")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse authResponse = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Inicio de sesión exitoso", authResponse));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Renovar access token",
            description = "Intercambia un refresh token válido por un nuevo par access token + refresh token. " +
                    "El refresh token usado queda revocado (rotación). Si se presenta un refresh token que ya fue rotado, " +
                    "se considera reutilización y se revocan todos los refresh tokens del usuario.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200",
                    description = "Token renovado; se devuelve un nuevo par de tokens"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400",
                    description = "Falta el refresh token en el body"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401",
                    description = "Refresh token inexistente, expirado, revocado o reutilizado")
    })
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse authResponse = authService.refresh(request);
        return ResponseEntity.ok(ApiResponse.success("Token renovado exitosamente", authResponse));
    }

    @PostMapping("/logout")
    @Operation(summary = "Cerrar sesión",
            description = "Revoca el refresh token enviado (revoked_reason = reason) y, si el header Authorization trae un " +
                    "access token todavía válido, agrega su jti a la lista negra para que deje de funcionar de inmediato. " +
                    "Funciona aunque el access token ya haya expirado, por eso no requiere autenticación. " +
                    "reason: INACTIVITY | MANUAL (por defecto MANUAL).")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200",
                    description = "Sesión cerrada (también si el token ya estaba revocado o no existía)"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400",
                    description = "reason distinto de INACTIVITY o MANUAL")
    })
    public ResponseEntity<ApiResponse<Void>> logout(
            @Valid @RequestBody(required = false) LogoutRequest request,
            @Parameter(description = "Access token opcional: Bearer <token>")
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization) {
        String accessToken = authorization != null && authorization.startsWith("Bearer ")
                ? authorization.substring(7)
                : null;
        authService.logout(request, accessToken);
        return ResponseEntity.ok(ApiResponse.success("Sesión cerrada exitosamente", null));
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
