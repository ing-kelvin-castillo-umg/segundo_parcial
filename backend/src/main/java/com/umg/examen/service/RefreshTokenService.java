package com.umg.examen.service;

import com.umg.examen.entity.RefreshToken;
import com.umg.examen.entity.User;
import com.umg.examen.repository.RefreshTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository repository;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.jwt.refresh-expiration-ms:604800000}")
    private long refreshExpirationMs;

    public RefreshTokenService(RefreshTokenRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public String create(User user) {
        byte[] randomBytes = new byte[48];
        secureRandom.nextBytes(randomBytes);
        String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setTokenHash(hash(rawToken));
        refreshToken.setExpiresAt(Instant.now().plusMillis(refreshExpirationMs));
        repository.save(refreshToken);

        return rawToken;
    }

    @Transactional
    public User consume(String rawToken) {
        RefreshToken refreshToken = repository.findByTokenHash(hash(rawToken))
                .orElseThrow(() -> new BadCredentialsException("Refresh token inválido"));

        if (!refreshToken.isUsable()) {
            throw new BadCredentialsException("Refresh token expirado o revocado");
        }

        // Rotación de un solo uso: el token anterior no puede reutilizarse.
        refreshToken.setRevokedAt(Instant.now());
        repository.save(refreshToken);
        return refreshToken.getUser();
    }

    @Transactional
    public String revoke(String rawToken) {
        return repository.findByTokenHash(hash(rawToken))
                .map(refreshToken -> {
                    if (refreshToken.getRevokedAt() == null) {
                        refreshToken.setRevokedAt(Instant.now());
                        repository.save(refreshToken);
                    }
                    return refreshToken.getUser().getUsername();
                })
                .orElse("desconocido");
    }

    private String hash(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] tokenHash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(tokenHash);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 no está disponible", exception);
        }
    }
}
