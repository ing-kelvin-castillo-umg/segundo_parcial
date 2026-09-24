package com.umg.examen.service.impl;

import com.umg.examen.entity.RefreshToken;
import com.umg.examen.entity.User;
import com.umg.examen.exception.InvalidRefreshTokenException;
import com.umg.examen.repository.RefreshTokenRepository;
import com.umg.examen.service.RefreshTokenService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;

/**
 * Política de refresh token (ver app.jwt en application.yml):
 * - El refresh token es un valor aleatorio opaco de 256 bits (no un JWT); en la BD solo se guarda su hash SHA-256.
 * - Vida útil definida por app.jwt.refresh-expiration-ms (por defecto 30 min), mayor que la del access token.
 * - Rotación: cada uso lo revoca y se emite uno nuevo.
 * - Detección de reutilización: presentar un token ya revocado revoca todos los tokens activos del usuario.
 */
@Service
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private static final Logger log = LoggerFactory.getLogger(RefreshTokenServiceImpl.class);
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${app.jwt.refresh-expiration-ms:1800000}")
    private long refreshExpirationMs;

    public RefreshTokenServiceImpl(RefreshTokenRepository refreshTokenRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
    }

    @Override
    @Transactional
    public String createRefreshToken(User user) {
        byte[] randomBytes = new byte[32];
        SECURE_RANDOM.nextBytes(randomBytes);
        String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);

        LocalDateTime expiresAt = LocalDateTime.now().plusNanos(refreshExpirationMs * 1_000_000);
        refreshTokenRepository.save(new RefreshToken(hash(rawToken), user, expiresAt));

        log.info("[REFRESH] Nuevo refresh token emitido para '{}' (expira {})", user.getUsername(), expiresAt);
        return rawToken;
    }

    @Override
    // No se hace rollback al lanzar la excepción: la revocación masiva por reutilización debe persistir.
    @Transactional(noRollbackFor = InvalidRefreshTokenException.class)
    public User verifyAndConsume(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new InvalidRefreshTokenException("Refresh token no proporcionado");
        }

        RefreshToken stored = refreshTokenRepository.findByTokenHash(hash(rawToken))
                .orElseThrow(() -> {
                    log.warn("[REFRESH] Refresh token desconocido");
                    return new InvalidRefreshTokenException("Refresh token inválido");
                });

        User user = stored.getUser();

        if (stored.getRevoked()) {
            int revoked = refreshTokenRepository.revokeAllByUser(user);
            log.warn("[REFRESH] Reutilización de refresh token revocado para '{}': se revocan {} tokens activos",
                    user.getUsername(), revoked);
            throw new InvalidRefreshTokenException("Refresh token revocado");
        }

        if (stored.isExpired()) {
            stored.setRevoked(true);
            log.warn("[REFRESH] Refresh token expirado para '{}'", user.getUsername());
            throw new InvalidRefreshTokenException("Refresh token expirado");
        }

        stored.setRevoked(true);
        log.info("[REFRESH] Refresh token validado y rotado para '{}'", user.getUsername());
        return user;
    }

    @Override
    public long getRefreshExpirationMs() {
        return refreshExpirationMs;
    }

    private static String hash(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(rawToken.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 no disponible", e);
        }
    }
}
