package com.umg.examen.task;

import com.umg.examen.service.AccessTokenBlacklistService;
import com.umg.examen.service.RefreshTokenService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** Limpia periódicamente la lista negra de access tokens y los refresh tokens ya expirados. */
@Component
public class TokenCleanupTask {

    private static final Logger log = LoggerFactory.getLogger(TokenCleanupTask.class);

    private final AccessTokenBlacklistService accessTokenBlacklistService;
    private final RefreshTokenService refreshTokenService;

    public TokenCleanupTask(AccessTokenBlacklistService accessTokenBlacklistService,
                            RefreshTokenService refreshTokenService) {
        this.accessTokenBlacklistService = accessTokenBlacklistService;
        this.refreshTokenService = refreshTokenService;
    }

    @Scheduled(fixedDelayString = "${app.jwt.cleanup-interval-ms:300000}",
               initialDelayString = "${app.jwt.cleanup-interval-ms:300000}")
    public void purgeExpiredTokens() {
        int blacklist = accessTokenBlacklistService.purgeExpired();
        int refresh = refreshTokenService.purgeExpired();
        if (blacklist > 0 || refresh > 0) {
            log.info("Limpieza de tokens: {} jti de lista negra y {} refresh tokens expirados eliminados",
                    blacklist, refresh);
        }
    }
}
