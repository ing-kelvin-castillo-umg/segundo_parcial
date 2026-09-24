package com.umg.examen.security;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TokenBlacklistService {

    private final Map<String, Instant> revokedTokens = new ConcurrentHashMap<>();

    public void revoke(String token, Instant expiresAt) {
        if (token == null || expiresAt == null) {
            return;
        }
        cleanupExpiredTokens();
        revokedTokens.put(token, expiresAt);
    }

    public boolean isRevoked(String token) {
        cleanupExpiredTokens();
        return revokedTokens.containsKey(token);
    }

    private void cleanupExpiredTokens() {
        Instant now = Instant.now();
        revokedTokens.entrySet().removeIf(entry -> entry.getValue().isBefore(now));
    }
}
