package com.umg.examen.service;

import com.umg.examen.entity.RefreshToken;
import com.umg.examen.entity.User;
import com.umg.examen.exception.InvalidRefreshTokenException;
import com.umg.examen.repository.RefreshTokenRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    private static final long EXPIRATION_MS = 604800000L;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    private RefreshTokenService refreshTokenService;
    private User user;

    @BeforeEach
    void setUp() {
        refreshTokenService = new RefreshTokenService(refreshTokenRepository, EXPIRATION_MS);
        user = new User();
        user.setUsername("admin");
        lenient().when(refreshTokenRepository.save(any(RefreshToken.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void issueStoresOnlySha256Hash() {
        RefreshTokenService.IssuedRefreshToken issued = refreshTokenService.issue(user);
        ArgumentCaptor<RefreshToken> captor = ArgumentCaptor.forClass(RefreshToken.class);

        verify(refreshTokenRepository).save(captor.capture());
        RefreshToken stored = captor.getValue();

        assertNotEquals(issued.value(), stored.getTokenHash());
        assertEquals(64, stored.getTokenHash().length());
        assertSame(user, stored.getUser());
        assertTrue(stored.getExpiresAt().isAfter(stored.getCreatedAt()));
        assertEquals(EXPIRATION_MS / 1000, issued.expiresInSeconds());
    }

    @Test
    void rotateRevokesCurrentTokenAndCreatesReplacement() {
        RefreshToken current = validToken();
        when(refreshTokenRepository.findByTokenHashForUpdate(anyString())).thenReturn(Optional.of(current));

        RefreshTokenService.RotatedRefreshToken rotated = refreshTokenService.rotate("current-raw-token");

        assertSame(user, rotated.user());
        assertNotNull(rotated.value());
        assertNotNull(current.getRevokedAt());
        assertNotNull(current.getReplacedBy());
        verify(refreshTokenRepository, times(2)).save(any(RefreshToken.class));
    }

    @Test
    void rotateRejectsReusedToken() {
        RefreshToken current = validToken();
        current.setRevokedAt(Instant.now().minusSeconds(1));
        when(refreshTokenRepository.findByTokenHashForUpdate(anyString())).thenReturn(Optional.of(current));

        assertThrows(InvalidRefreshTokenException.class,
                () -> refreshTokenService.rotate("reused-token"));
    }

    @Test
    void rotateRejectsExpiredToken() {
        RefreshToken current = validToken();
        current.setExpiresAt(Instant.now().minusSeconds(1));
        when(refreshTokenRepository.findByTokenHashForUpdate(anyString())).thenReturn(Optional.of(current));

        assertThrows(InvalidRefreshTokenException.class,
                () -> refreshTokenService.rotate("expired-token"));
    }

    @Test
    void rotateRejectsUnknownToken() {
        when(refreshTokenRepository.findByTokenHashForUpdate(anyString())).thenReturn(Optional.empty());

        assertThrows(InvalidRefreshTokenException.class,
                () -> refreshTokenService.rotate("unknown-token"));
    }

    @Test
    void revokeMarksTokenAsRevoked() {
        RefreshToken current = validToken();
        when(refreshTokenRepository.findByTokenHashForUpdate(anyString())).thenReturn(Optional.of(current));

        refreshTokenService.revoke("valid-token");

        assertNotNull(current.getRevokedAt());
        verify(refreshTokenRepository).save(current);
    }

    private RefreshToken validToken() {
        RefreshToken token = new RefreshToken();
        token.setUser(user);
        token.setTokenHash("a".repeat(64));
        token.setCreatedAt(Instant.now().minusSeconds(1));
        token.setExpiresAt(Instant.now().plusSeconds(60));
        return token;
    }
}
