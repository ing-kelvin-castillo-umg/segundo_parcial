package com.umg.examen.security;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TokenRevocationService {

    private final Map<String, Instant> revokedTokens = new ConcurrentHashMap<>();

    public void revoke(String tokenId, Instant expiresAt) {
        removeExpiredEntries();
        revokedTokens.put(tokenId, expiresAt);
    }

    public boolean isRevoked(String tokenId) {
        removeExpiredEntries();
        return revokedTokens.containsKey(tokenId);
    }

    private void removeExpiredEntries() {
        Instant now = Instant.now();
        revokedTokens.entrySet().removeIf(entry -> !entry.getValue().isAfter(now));
    }
}
