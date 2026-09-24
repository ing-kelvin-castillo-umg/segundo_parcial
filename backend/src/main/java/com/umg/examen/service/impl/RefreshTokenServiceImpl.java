package com.umg.examen.service.impl;

import com.umg.examen.entity.RefreshToken;
import com.umg.examen.entity.User;
import com.umg.examen.exception.InvalidRefreshTokenException;
import com.umg.examen.repository.RefreshTokenRepository;
import com.umg.examen.service.IssuedRefreshToken;
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
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.UUID;

@Service
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private static final Logger log = LoggerFactory.getLogger(RefreshTokenServiceImpl.class);

    private static final String REASON_ROTATED = "ROTATED";
    private static final String REASON_LOGOUT = "LOGOUT";
    private static final String REASON_REUSE = "REUSE_DETECTED";
    private static final String REASON_EXPIRED = "EXPIRED";

    private final SecureRandom secureRandom = new SecureRandom();
    private final RefreshTokenRepository repository;

    @Value("${app.jwt.refresh-expiration-ms:604800000}")
    private long refreshExpirationMs;

    @Value("${app.jwt.session-max-ms:2592000000}")
    private long sessionMaxMs;

    public RefreshTokenServiceImpl(RefreshTokenRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public IssuedRefreshToken issue(User user) {
        Instant now = Instant.now();
        repository.deleteExpiredSessions(user.getId(), now);
        return create(user, UUID.randomUUID().toString(), now, now.plusMillis(sessionMaxMs));
    }

    // noRollbackFor: la revocación por reutilización o vencimiento debe persistir aunque se lance la excepción.
    @Override
    @Transactional(noRollbackFor = InvalidRefreshTokenException.class)
    public IssuedRefreshToken rotate(String rawToken) {
        RefreshToken current = repository.findByTokenHashForUpdate(hash(rawToken))
                .orElseThrow(InvalidRefreshTokenException::new);
        Instant now = Instant.now();

        if (current.getRevokedAt() != null) {
            // Un token ya rotado o cerrado se presentó de nuevo: posible robo. Se revoca toda la sesión.
            repository.revokeFamily(current.getFamilyId(), now, REASON_REUSE);
            log.warn("Reutilización de refresh token detectada; sesión {} revocada", current.getFamilyId());
            throw new InvalidRefreshTokenException();
        }
        if (!current.getExpiresAt().isAfter(now) || !current.getSessionExpiresAt().isAfter(now)
                || !Boolean.TRUE.equals(current.getUser().getEnabled())) {
            repository.revokeFamily(current.getFamilyId(), now, REASON_EXPIRED);
            throw new InvalidRefreshTokenException();
        }

        current.setRevokedAt(now);
        current.setRevokedReason(REASON_ROTATED);
        repository.save(current);
        return create(current.getUser(), current.getFamilyId(), now, current.getSessionExpiresAt());
    }

    @Override
    @Transactional
    public void revoke(String rawToken) {
        repository.findByTokenHashForUpdate(hash(rawToken))
                .ifPresent(token -> repository.revokeFamily(token.getFamilyId(), Instant.now(), REASON_LOGOUT));
    }

    private IssuedRefreshToken create(User user, String familyId, Instant now, Instant sessionExpiresAt) {
        String raw = generateRawToken();
        Instant expiresAt = now.plusMillis(refreshExpirationMs);
        if (expiresAt.isAfter(sessionExpiresAt)) {
            expiresAt = sessionExpiresAt; // la rotación nunca supera la vida máxima de la sesión
        }

        RefreshToken entity = new RefreshToken();
        entity.setTokenHash(hash(raw));
        entity.setUser(user);
        entity.setFamilyId(familyId);
        entity.setIssuedAt(now);
        entity.setExpiresAt(expiresAt);
        entity.setSessionExpiresAt(sessionExpiresAt);
        repository.save(entity);
        return new IssuedRefreshToken(raw, user, expiresAt);
    }

    /** 256 bits de un generador criptográficamente seguro, en Base64 URL-safe. */
    private String generateRawToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hash(String rawToken) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 no disponible", e);
        }
    }
}
