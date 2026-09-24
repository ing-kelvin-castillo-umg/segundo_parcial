package com.umg.examen.service;

import com.umg.examen.entity.RefreshToken;
import com.umg.examen.entity.User;
import com.umg.examen.exception.InvalidRefreshTokenException;
import com.umg.examen.repository.RefreshTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;

@Service
public class RefreshTokenService {

    private static final int TOKEN_BYTES = 32;

    private final RefreshTokenRepository refreshTokenRepository;
    private final SecureRandom secureRandom = new SecureRandom();
    private final long expirationMs;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository,
                               @Value("${app.auth.refresh-token.expiration-ms:604800000}") long expirationMs) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.expirationMs = expirationMs;
    }

    public IssuedRefreshToken issue(User user) {
        return createAndStore(user);
    }

    public RotatedRefreshToken rotate(String rawToken) {
        RefreshToken currentToken = refreshTokenRepository.findByTokenHashForUpdate(hash(rawToken))
                .orElseThrow(InvalidRefreshTokenException::new);
        Instant now = Instant.now();

        if (currentToken.getRevokedAt() != null || !currentToken.getExpiresAt().isAfter(now)) {
            throw new InvalidRefreshTokenException();
        }

        IssuedRefreshToken replacement = createAndStore(currentToken.getUser());
        currentToken.setRevokedAt(now);
        currentToken.setReplacedBy(replacement.entity());
        refreshTokenRepository.save(currentToken);

        return new RotatedRefreshToken(currentToken.getUser(), replacement.value(), replacement.expiresInSeconds());
    }

    public void revoke(String rawToken) {
        refreshTokenRepository.findByTokenHashForUpdate(hash(rawToken)).ifPresent(token -> {
            if (token.getRevokedAt() == null) {
                token.setRevokedAt(Instant.now());
                refreshTokenRepository.save(token);
            }
        });
    }

    private IssuedRefreshToken createAndStore(User user) {
        String rawToken = generateToken();
        Instant now = Instant.now();

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setTokenHash(hash(rawToken));
        refreshToken.setCreatedAt(now);
        refreshToken.setExpiresAt(now.plusMillis(expirationMs));
        RefreshToken savedToken = refreshTokenRepository.save(refreshToken);

        return new IssuedRefreshToken(rawToken, expirationMs / 1000, savedToken);
    }

    private String generateToken() {
        byte[] bytes = new byte[TOKEN_BYTES];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hash(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 no está disponible", exception);
        }
    }

    public record IssuedRefreshToken(String value, long expiresInSeconds, RefreshToken entity) {
    }

    public record RotatedRefreshToken(User user, String value, long expiresInSeconds) {
    }
}
