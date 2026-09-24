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
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Optional;

@Service
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private static final Logger log = LoggerFactory.getLogger(RefreshTokenServiceImpl.class);

    /** 64 bytes aleatorios = 512 bits de entropía. */
    private static final int TOKEN_BYTES = 64;

    private final SecureRandom secureRandom = new SecureRandom();
    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${app.jwt.refresh-expiration-ms:86400000}")
    private long refreshExpirationMs;

    public RefreshTokenServiceImpl(RefreshTokenRepository refreshTokenRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
    }

    @Override
    @Transactional
    public IssuedRefreshToken create(User user) {
        String rawToken = generateRawToken();
        LocalDateTime expiresAt = LocalDateTime.now().plusNanos(refreshExpirationMs * 1_000_000L);

        refreshTokenRepository.save(new RefreshToken(hash(rawToken), user, expiresAt));
        log.info("Refresh token emitido para usuario={} (expira {})", user.getUsername(), expiresAt);

        return new IssuedRefreshToken(rawToken, expiresAt);
    }

    /**
     * noRollbackFor: las revocaciones hechas antes de lanzar la excepción (token expirado,
     * reutilización detectada) deben persistir aunque la petición termine en 401.
     */
    @Override
    @Transactional(noRollbackFor = InvalidRefreshTokenException.class)
    public RotationResult rotate(String rawToken) {
        if (!StringUtils.hasText(rawToken)) {
            throw new InvalidRefreshTokenException("Refresh token no proporcionado");
        }

        RefreshToken current = refreshTokenRepository.findByTokenHashForUpdate(hash(rawToken))
                .orElseThrow(() -> {
                    log.warn("Intento de refresh con un token inexistente");
                    return new InvalidRefreshTokenException("Refresh token inválido o inexistente");
                });

        User user = current.getUser();

        if (current.isRevoked()) {
            if (REASON_ROTATED.equals(current.getRevokedReason())) {
                // Un token ya rotado se volvió a presentar: posible robo. Se cierran todas las sesiones del usuario.
                int revoked = revokeAllForUser(user, REASON_REUSE_DETECTED);
                log.warn("Reutilización de refresh token detectada para usuario={}; {} tokens activos revocados",
                        user.getUsername(), revoked);
                throw new InvalidRefreshTokenException(
                        "Refresh token reutilizado. Por seguridad se cerraron todas las sesiones; inicia sesión nuevamente");
            }
            log.warn("Intento de refresh con token revocado ({}) para usuario={}",
                    current.getRevokedReason(), user.getUsername());
            throw new InvalidRefreshTokenException("Refresh token revocado. Inicia sesión nuevamente");
        }

        if (current.isExpired()) {
            current.revoke(REASON_EXPIRED);
            log.info("Refresh token expirado para usuario={}", user.getUsername());
            throw new InvalidRefreshTokenException("Refresh token expirado. Inicia sesión nuevamente");
        }

        if (!Boolean.TRUE.equals(user.getEnabled())) {
            revokeAllForUser(user, REASON_USER_DISABLED);
            throw new InvalidRefreshTokenException("El usuario está deshabilitado");
        }

        current.revoke(REASON_ROTATED);
        IssuedRefreshToken next = create(user);
        log.info("Refresh token rotado para usuario={}", user.getUsername());

        return new RotationResult(user, next);
    }

    @Override
    @Transactional
    public Optional<User> revoke(String rawToken, String reason) {
        if (!StringUtils.hasText(rawToken)) {
            return Optional.empty();
        }
        return refreshTokenRepository.findByTokenHash(hash(rawToken))
                .filter(token -> !token.isRevoked())
                .map(token -> {
                    token.revoke(reason);
                    log.info("Refresh token revocado ({}) para usuario={}", reason, token.getUser().getUsername());
                    return token.getUser();
                });
    }

    @Override
    @Transactional
    public int revokeAllForUser(User user, String reason) {
        return refreshTokenRepository.revokeAllActiveByUser(user, reason, LocalDateTime.now());
    }

    @Override
    @Transactional
    public int purgeExpired() {
        return refreshTokenRepository.deleteAllExpired(LocalDateTime.now());
    }

    @Override
    public long getRefreshExpirationMs() {
        return refreshExpirationMs;
    }

    private String generateRawToken() {
        byte[] bytes = new byte[TOKEN_BYTES];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static String hash(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(rawToken.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 no disponible en la JVM", e);
        }
    }
}
