package com.umg.examen.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "Respuesta interna de autenticación con Access Token y Refresh Token")
public class AuthResponse {

    @Schema(description = "Token de acceso JWT")
    private String accessToken;

    @Schema(description = "Refresh Token opaco")
    private String refreshToken;

    @Schema(description = "Duración del Access Token en segundos")
    private long accessTokenExpiresInSeconds;

    @Schema(description = "Duración del Refresh Token en segundos")
    private long refreshTokenExpiresInSeconds;

    @Schema(description = "Tipo de token", example = "Bearer")
    private String type = "Bearer";

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

    public long getAccessTokenExpiresInSeconds() {
        return accessTokenExpiresInSeconds;
    }

    public void setAccessTokenExpiresInSeconds(long accessTokenExpiresInSeconds) {
        this.accessTokenExpiresInSeconds = accessTokenExpiresInSeconds;
    }

    public long getRefreshTokenExpiresInSeconds() {
        return refreshTokenExpiresInSeconds;
    }

    public void setRefreshTokenExpiresInSeconds(long refreshTokenExpiresInSeconds) {
        this.refreshTokenExpiresInSeconds = refreshTokenExpiresInSeconds;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
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
