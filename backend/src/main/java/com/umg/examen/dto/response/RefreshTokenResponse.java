package com.umg.examen.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Respuesta con nuevo token de acceso renovado")
public class RefreshTokenResponse {

    @Schema(description = "Nuevo token de acceso JWT", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
    private String accessToken;

    @Schema(description = "Tipo de token", example = "Bearer")
    private String type = "Bearer";

    @Schema(description = "Token de refresco para próximas renovaciones", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
    private String refreshToken;

    @Schema(description = "Tiempo en milisegundos hasta la expiración del nuevo access token", example = "86400000")
    private Long expiresIn;

    public RefreshTokenResponse() {}

    public RefreshTokenResponse(String accessToken, String refreshToken, Long expiresIn) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiresIn = expiresIn;
        this.type = "Bearer";
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public Long getExpiresIn() {
        return expiresIn;
    }

    public void setExpiresIn(Long expiresIn) {
        this.expiresIn = expiresIn;
    }
}
