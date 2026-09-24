package com.umg.examen.service.impl;

import com.umg.examen.entity.RevokedAccessToken;
import com.umg.examen.entity.User;
import com.umg.examen.repository.RevokedAccessTokenRepository;
import com.umg.examen.service.AccessTokenBlacklistService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

@Service
public class AccessTokenBlacklistServiceImpl implements AccessTokenBlacklistService {

    private final RevokedAccessTokenRepository revokedAccessTokenRepository;

    public AccessTokenBlacklistServiceImpl(RevokedAccessTokenRepository revokedAccessTokenRepository) {
        this.revokedAccessTokenRepository = revokedAccessTokenRepository;
    }

    @Override
    @Transactional
    public void revoke(String jti, User user, LocalDateTime expiresAt, String reason) {
        if (!StringUtils.hasText(jti) || revokedAccessTokenRepository.existsByJti(jti)) {
            return;
        }
        revokedAccessTokenRepository.save(new RevokedAccessToken(jti, user, expiresAt, reason));
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isRevoked(String jti) {
        return StringUtils.hasText(jti) && revokedAccessTokenRepository.existsByJti(jti);
    }

    @Override
    @Transactional
    public int purgeExpired() {
        return revokedAccessTokenRepository.deleteAllExpired(LocalDateTime.now());
    }
}
