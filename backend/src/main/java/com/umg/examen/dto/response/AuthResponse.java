package com.umg.examen.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "Respuesta de autenticación con access token JWT y refresh token")
public class AuthResponse {

    @Schema(description = "Access token JWT de corta duración")
    private String accessToken;

    @Schema(description = "Refresh token opaco; se rota en cada uso de /api/auth/refresh")
    private String refreshToken;

    @Schema(description = "Tipo de token", example = "Bearer")
    private String tokenType = "Bearer";

    @Schema(description = "Segundos de vida restantes del access token", example = "60")
    private long expiresIn;

    @Schema(description = "Segundos de vida restantes del refresh token", example = "86400")
    private long refreshExpiresIn;

    @Schema(description = "Nombre de usuario", example = "admin")
    private String username;

    @Schema(description = "Nombre completo del usuario", example = "Administrador del Sistema")
    private String fullName;

    @Schema(description = "Correo electrónico", example = "admin@umg.edu.gt")
    private String email;

    @Schema(description = "Lista de roles asignados", example = "[\"ROLE_ADMIN\"]")
    private List<String> roles;

    public AuthResponse() {}

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public long getExpiresIn() {
        return expiresIn;
    }

    public void setExpiresIn(long expiresIn) {
        this.expiresIn = expiresIn;
    }

    public long getRefreshExpiresIn() {
        return refreshExpiresIn;
    }

    public void setRefreshExpiresIn(long refreshExpiresIn) {
        this.refreshExpiresIn = refreshExpiresIn;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }
}
