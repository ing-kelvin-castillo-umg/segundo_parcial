package com.umg.examen.service.impl;

import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.umg.examen.entity.RefreshToken;
import com.umg.examen.entity.User;
import com.umg.examen.repository.RefreshTokenRepository;
import com.umg.examen.service.RefreshTokenService;

@Service
@Transactional
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private static final Logger log = LoggerFactory.getLogger(RefreshTokenServiceImpl.class);

    private final RefreshTokenRepository refreshTokenRepository;

    // Refresh token validity in days
    private static final long REFRESH_TOKEN_VALIDITY_DAYS = 30;

    public RefreshTokenServiceImpl(RefreshTokenRepository refreshTokenRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
    }

    @Override
    public RefreshToken createRefreshToken(User user) {
        // First, revoke all existing tokens for this user to ensure only one active refresh token
        revokeAllUserTokens(user);

        LocalDateTime expiryDate = LocalDateTime.now().plusDays(REFRESH_TOKEN_VALIDITY_DAYS);
        String token = generateSecureToken();

        RefreshToken refreshToken = new RefreshToken(token, user, expiryDate);
        return refreshTokenRepository.save(refreshToken);
    }

    @Override
    public RefreshToken validateRefreshToken(String token) {
        return refreshTokenRepository.findByToken(token)
                .filter(RefreshToken::isValid)
                .orElseThrow(() -> new IllegalArgumentException("Refresh token inválido o expirado"));
    }

    @Override
    public void revokeRefreshToken(String token) {
        refreshTokenRepository.findByToken(token).ifPresent(refreshToken -> {
            refreshToken.setRevoked(true);
            refreshToken.setRevokedAt(LocalDateTime.now());
            refreshTokenRepository.save(refreshToken);
            log.info("Refresh token revocado para usuario: {}", refreshToken.getUser().getUsername());
        });
    }

    @Override
    public void revokeAllUserTokens(User user) {
        refreshTokenRepository.revokeAllUserTokens(user);
    }

    @Override
    public void deleteExpiredTokens() {
        refreshTokenRepository.deleteExpiredTokens(LocalDateTime.now());
    }

    private String generateSecureToken() {
        return java.util.UUID.randomUUID().toString();
    }
}
