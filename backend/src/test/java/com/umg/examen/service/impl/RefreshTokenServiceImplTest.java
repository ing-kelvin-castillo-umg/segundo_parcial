package com.umg.examen.service.impl;

import com.umg.examen.entity.RefreshToken;
import com.umg.examen.entity.User;
import com.umg.examen.exception.InvalidRefreshTokenException;
import com.umg.examen.repository.RefreshTokenRepository;
import com.umg.examen.service.IssuedRefreshToken;
import com.umg.examen.service.RevocationReason;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceImplTest {

    private static final long REFRESH_MS = Duration.ofDays(7).toMillis();
    private static final long SESSION_MS = Duration.ofDays(30).toMillis();

    @Mock
    private RefreshTokenRepository repository;

    private RefreshTokenServiceImpl service;
    private User user;

    @BeforeEach
    void setUp() {
        service = new RefreshTokenServiceImpl(repository);
        ReflectionTestUtils.setField(service, "refreshExpirationMs", REFRESH_MS);
        ReflectionTestUtils.setField(service, "sessionMaxMs", SESSION_MS);
        user = new User();
        user.setId(1L);
        user.setUsername("admin");
        user.setEnabled(true);
    }

    private static String sha256(String raw) throws Exception {
        return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(raw.getBytes(StandardCharsets.UTF_8)));
    }

    private RefreshToken stored(String raw, Instant expiresAt, Instant sessionExpiresAt, Instant revokedAt) throws Exception {
        RefreshToken t = new RefreshToken();
        t.setTokenHash(sha256(raw));
        t.setUser(user);
        t.setFamilyId("familia-1");
        t.setIssuedAt(Instant.now().minusSeconds(60));
        t.setExpiresAt(expiresAt);
        t.setSessionExpiresAt(sessionExpiresAt);
        t.setRevokedAt(revokedAt);
        return t;
    }

    @Test
    void issue_guardaSoloElHashYNoElTokenEnClaro() throws Exception {
        IssuedRefreshToken issued = service.issue(user);

        ArgumentCaptor<RefreshToken> captor = ArgumentCaptor.forClass(RefreshToken.class);
        verify(repository).save(captor.capture());
        RefreshToken saved = captor.getValue();

        assertEquals(sha256(issued.token()), saved.getTokenHash());
        assertEquals(64, saved.getTokenHash().length());
        assertNotEquals(issued.token(), saved.getTokenHash());
        assertTrue(issued.token().length() >= 43, "256 bits en Base64");
        assertNull(saved.getRevokedAt());
        assertNotNull(saved.getFamilyId());
        assertTrue(Duration.between(Instant.now(), saved.getExpiresAt()).toMillis() > REFRESH_MS - 5_000);
    }

    @Test
    void issue_generaTokensDistintos() {
        assertNotEquals(service.issue(user).token(), service.issue(user).token());
    }

    @Test
    void rotate_valido_invalidaElAnteriorYEmiteUnoNuevoDeLaMismaSesion() throws Exception {
        Instant sessionEnd = Instant.now().plus(Duration.ofDays(10));
        RefreshToken current = stored("viejo", Instant.now().plus(Duration.ofDays(1)), sessionEnd, null);
        when(repository.findByTokenHashForUpdate(sha256("viejo"))).thenReturn(Optional.of(current));

        IssuedRefreshToken next = service.rotate("viejo");

        assertNotEquals("viejo", next.token());
        assertNotNull(current.getRevokedAt(), "el token usado queda revocado");
        assertEquals("ROTATED", current.getRevokedReason());

        ArgumentCaptor<RefreshToken> captor = ArgumentCaptor.forClass(RefreshToken.class);
        verify(repository, times(2)).save(captor.capture());
        RefreshToken created = captor.getAllValues().get(1);
        assertEquals("familia-1", created.getFamilyId());
        assertEquals(sessionEnd, created.getSessionExpiresAt(), "la rotación no extiende la vida máxima de la sesión");
        assertEquals(sha256(next.token()), created.getTokenHash());
    }

    @Test
    void rotate_noSuperaLaVidaMaximaDeLaSesion() throws Exception {
        Instant sessionEnd = Instant.now().plus(Duration.ofHours(1));
        RefreshToken current = stored("t", Instant.now().plus(Duration.ofDays(1)), sessionEnd, null);
        when(repository.findByTokenHashForUpdate(sha256("t"))).thenReturn(Optional.of(current));

        IssuedRefreshToken next = service.rotate("t");

        assertEquals(sessionEnd, next.expiresAt(), "el nuevo token vence como máximo al terminar la sesión");
    }

    @Test
    void rotate_tokenYaRotado_revocaTodaLaSesionYRechaza() throws Exception {
        RefreshToken current = stored("usado", Instant.now().plus(Duration.ofDays(1)), Instant.now().plus(Duration.ofDays(10)), Instant.now().minusSeconds(5));
        when(repository.findByTokenHashForUpdate(sha256("usado"))).thenReturn(Optional.of(current));

        assertThrows(InvalidRefreshTokenException.class, () -> service.rotate("usado"));

        verify(repository).revokeFamily(eq("familia-1"), any(Instant.class), eq("REUSE_DETECTED"));
        verify(repository, never()).save(any());
    }

    @Test
    void rotate_tokenVencido_rechaza() throws Exception {
        RefreshToken current = stored("vencido", Instant.now().minusSeconds(1), Instant.now().plus(Duration.ofDays(10)), null);
        when(repository.findByTokenHashForUpdate(sha256("vencido"))).thenReturn(Optional.of(current));

        assertThrows(InvalidRefreshTokenException.class, () -> service.rotate("vencido"));

        verify(repository).revokeFamily(eq("familia-1"), any(Instant.class), eq("EXPIRED"));
        verify(repository, never()).save(any());
    }

    @Test
    void rotate_sesionSobreSuVidaMaxima_rechaza() throws Exception {
        RefreshToken current = stored("t", Instant.now().plus(Duration.ofDays(1)), Instant.now().minusSeconds(1), null);
        when(repository.findByTokenHashForUpdate(sha256("t"))).thenReturn(Optional.of(current));

        assertThrows(InvalidRefreshTokenException.class, () -> service.rotate("t"));
    }

    @Test
    void rotate_usuarioDeshabilitado_rechaza() throws Exception {
        user.setEnabled(false);
        RefreshToken current = stored("t", Instant.now().plus(Duration.ofDays(1)), Instant.now().plus(Duration.ofDays(10)), null);
        when(repository.findByTokenHashForUpdate(sha256("t"))).thenReturn(Optional.of(current));

        assertThrows(InvalidRefreshTokenException.class, () -> service.rotate("t"));
    }

    @Test
    void rotate_tokenDesconocido_rechaza() throws Exception {
        when(repository.findByTokenHashForUpdate(sha256("inventado"))).thenReturn(Optional.empty());

        assertThrows(InvalidRefreshTokenException.class, () -> service.rotate("inventado"));
        verify(repository, never()).save(any());
    }

    @Test
    void revoke_revocaLaSesionCompleta() throws Exception {
        RefreshToken current = stored("t", Instant.now().plus(Duration.ofDays(1)), Instant.now().plus(Duration.ofDays(10)), null);
        when(repository.findByTokenHashForUpdate(sha256("t"))).thenReturn(Optional.of(current));

        service.revoke("t", RevocationReason.LOGOUT);

        verify(repository).revokeFamily(eq("familia-1"), any(Instant.class), eq("LOGOUT"));
    }

    @Test
    void revoke_tokenDesconocido_esIdempotente() throws Exception {
        when(repository.findByTokenHashForUpdate(sha256("nada"))).thenReturn(Optional.empty());

        assertDoesNotThrow(() -> service.revoke("nada", RevocationReason.LOGOUT));
        verify(repository, never()).revokeFamily(any(), any(), any());
    }
}
