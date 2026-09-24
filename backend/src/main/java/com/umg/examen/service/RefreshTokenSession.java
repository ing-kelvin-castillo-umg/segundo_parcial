package com.umg.examen.service;

import java.time.Instant;

public record RefreshTokenSession(String token, Instant expiresAt) {
}
