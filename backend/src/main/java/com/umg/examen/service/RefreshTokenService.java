package com.umg.examen.service;

import com.umg.examen.entity.RefreshToken;
import com.umg.examen.entity.User;

public interface RefreshTokenService {
    RefreshToken createRefreshToken(User user);
    RefreshToken verifyExpiration(RefreshToken token);
    RefreshToken findByTokenOrThrow(String token);
    void revokeByToken(String token);
}