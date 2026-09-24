package com.umg.examen.service;

import com.umg.examen.entity.User;

import java.time.LocalDateTime;

public interface RefreshTokenService {

    String REASON_ROTATED = "ROTATED";
    String REASON_EXPIRED = "EXPIRED";
    String REASON_REUSE_DETECTED = "REUSE_DETECTED";
    String REASON_USER_DISABLED = "USER_DISABLED";
    String REASON_LOGOUT = "LOGOUT";

    /** Token plano recién emitido (solo se entrega al cliente, nunca se persiste). */
    record IssuedRefreshToken(String token, LocalDateTime expiresAt) {}

    /** Resultado de una rotación: el dueño del token y el nuevo refresh token emitido. */
    record RotationResult(User user, IssuedRefreshToken refreshToken) {}

    /** Crea y persiste un nuevo refresh token para el usuario. */
    IssuedRefreshToken create(User user);

    /**
     * Valida el refresh token, lo revoca y emite uno nuevo (rotación).
     * Si el token ya había sido rotado (reutilización), revoca todos los tokens del usuario.
     *
     * @throws com.umg.examen.exception.InvalidRefreshTokenException si no existe, expiró o fue revocado
     */
    RotationResult rotate(String rawToken);

    /** Revoca un refresh token puntual. Devuelve false si no existía o ya estaba revocado. */
    boolean revoke(String rawToken, String reason);

    /** Revoca todos los refresh tokens activos del usuario. */
    int revokeAllForUser(User user, String reason);

    long getRefreshExpirationMs();
}
