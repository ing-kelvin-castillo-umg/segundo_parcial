package com.umg.examen.security;

import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class TokenBlacklist {
    private final Map<String, Long> revokedTokens = new ConcurrentHashMap<>();
    private final JwtTokenProvider tokenProvider;

    public TokenBlacklist(JwtTokenProvider tokenProvider) {
        this.tokenProvider = tokenProvider;
    }

    public void invalidate(String token) {
        if (!tokenProvider.validateToken(token)) return;
        long now = System.currentTimeMillis();
        revokedTokens.entrySet().removeIf(entry -> entry.getValue() <= now);
        revokedTokens.put(tokenProvider.getTokenId(token), tokenProvider.getExpiration(token).getTime());
    }

    public boolean isRevoked(String token) {
        String tokenId = tokenProvider.getTokenId(token);
        Long expiresAt = revokedTokens.get(tokenId);
        if (expiresAt == null) return false;
        if (expiresAt <= System.currentTimeMillis()) {
            revokedTokens.remove(tokenId, expiresAt);
            return false;
        }
        return true;
    }
}
