package com.umg.examen.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Solicitud de renovación o cierre de sesión con refresh token")
public class RefreshTokenRequest {

    @NotBlank(message = "El refresh token es obligatorio")
    @Schema(description = "Refresh token emitido en el login o en la última renovación")
    private String refreshToken;

    @Schema(description = "Motivo del cierre de sesión (solo logout): INACTIVITY cuando el frontend cierra por inactividad",
            example = "INACTIVITY", allowableValues = {"INACTIVITY", "LOGOUT"})
    private String reason;

    public RefreshTokenRequest() {}

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
