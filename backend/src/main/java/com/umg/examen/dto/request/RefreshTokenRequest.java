package com.umg.examen.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Petición para renovar el access token")
public class RefreshTokenRequest {

    @NotBlank(message = "El refresh token es obligatorio")
    @Schema(description = "Refresh token opaco obtenido en el login o en el último refresh",
            example = "q3T0p9m1V2xYw8Zk...")
    private String refreshToken;

    public RefreshTokenRequest() {}

    public RefreshTokenRequest(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
}
