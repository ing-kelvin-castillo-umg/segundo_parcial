package com.umg.examen.service;

import com.umg.examen.entity.User;

public interface RefreshTokenService {
    RefreshTokenSession createToken(User user);
    User getValidTokenUser(String rawToken);
}
