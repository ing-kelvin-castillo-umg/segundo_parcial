package com.umg.examen.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Pattern;

@Schema(description = "Petición de cierre de sesión")
public class LogoutRequest {

    public static final String REASON_MANUAL = "MANUAL";
    public static final String REASON_INACTIVITY = "INACTIVITY";

    @Schema(description = "Refresh token de la sesión a cerrar (opcional; si viene, se revoca)",
            example = "q3T0p9m1V2xYw8Zk...")
    private String refreshToken;

    @Pattern(regexp = "INACTIVITY|MANUAL", message = "El motivo debe ser INACTIVITY o MANUAL")
    @Schema(description = "Motivo del cierre de sesión", allowableValues = {"INACTIVITY", "MANUAL"},
            defaultValue = "MANUAL", example = "INACTIVITY")
    private String reason;

    public LogoutRequest() {}

    public LogoutRequest(String refreshToken, String reason) {
        this.refreshToken = refreshToken;
        this.reason = reason;
    }

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

    /** Motivo efectivo: MANUAL cuando no se especifica. */
    public String resolvedReason() {
        return reason == null || reason.isBlank() ? REASON_MANUAL : reason;
    }
}
