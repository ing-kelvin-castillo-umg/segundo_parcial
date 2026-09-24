package com.umg.examen.service;

import com.umg.examen.entity.User;

import java.time.Instant;

/** Refresh token recién emitido (valor en claro, visible solo en este momento) junto a su usuario. */
public record IssuedRefreshToken(String token, User user, Instant expiresAt) {}
