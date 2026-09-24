package com.umg.examen.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Respuesta con las credenciales renovadas")
public class TokenRefreshResponse {

    @Schema(description = "Nuevo token de acceso JWT")
    private String token;

    @Schema(description = "Nuevo refresh token (rotación en cada renovación)")
    private String refreshToken;

    @Schema(description = "Tipo de token", example = "Bearer")
    private String type = "Bearer";

    @Schema(description = "Vigencia del token de acceso en milisegundos", example = "120000")
    private Long expiresInMs;

    public TokenRefreshResponse() {}

    public TokenRefreshResponse(String token, String refreshToken, Long expiresInMs) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.type = "Bearer";
        this.expiresInMs = expiresInMs;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Long getExpiresInMs() {
        return expiresInMs;
    }

    public void setExpiresInMs(Long expiresInMs) {
        this.expiresInMs = expiresInMs;
    }
}
