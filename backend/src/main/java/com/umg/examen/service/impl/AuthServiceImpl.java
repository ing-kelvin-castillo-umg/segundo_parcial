package com.umg.examen.service.impl;

import com.umg.examen.dto.request.LoginRequest;
import com.umg.examen.dto.response.AuthResponse;
import com.umg.examen.dto.response.TokenRefreshResponse;
import com.umg.examen.dto.response.UserResponse;
import com.umg.examen.entity.RefreshToken;
import com.umg.examen.entity.RevokedAccessToken;
import com.umg.examen.entity.Role;
import com.umg.examen.entity.User;
import com.umg.examen.mapper.UserMapper;
import com.umg.examen.repository.RefreshTokenRepository;
import com.umg.examen.repository.RevokedAccessTokenRepository;
import com.umg.examen.repository.UserRepository;
import com.umg.examen.security.JwtTokenProvider;
import com.umg.examen.service.AuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import io.jsonwebtoken.Claims;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final RevokedAccessTokenRepository revokedAccessTokenRepository;
    private final UserMapper userMapper;

    public AuthServiceImpl(AuthenticationManager authenticationManager,
                           JwtTokenProvider tokenProvider,
                           UserRepository userRepository,
                           RefreshTokenRepository refreshTokenRepository,
                           RevokedAccessTokenRepository revokedAccessTokenRepository,
                           UserMapper userMapper) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.revokedAccessTokenRepository = revokedAccessTokenRepository;
        this.userMapper = userMapper;
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + request.getUsername()));

        String refreshToken = issueRefreshToken(user);

        AuthResponse response = userMapper.toAuthResponse(user, token);
        response.setRefreshToken(refreshToken);
        response.setExpiresInMs(tokenProvider.getJwtExpirationMs());
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public TokenRefreshResponse refresh(String refreshToken) {
        RefreshToken stored = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new RefreshTokenException("Refresh token no reconocido. Vuelve a iniciar sesión."));

        if (!stored.isUsable()) {
            throw new RefreshTokenException("Refresh token expirado o revocado. Vuelve a iniciar sesión.");
        }

        User user = stored.getUser();

        // Rotación: el refresh token usado se revoca y se entrega uno nuevo, de modo
        // que un token filtrado deja de servir en cuanto el usuario legítimo renueva.
        stored.setRevoked(true);
        refreshTokenRepository.save(stored);

        List<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toList());

        String newAccessToken = tokenProvider.generateTokenFromUsername(user.getUsername(), roles);
        String newRefreshToken = issueRefreshToken(user);

        log.info("Credenciales renovadas para el usuario '{}'", user.getUsername());

        return new TokenRefreshResponse(newAccessToken, newRefreshToken, tokenProvider.getJwtExpirationMs());
    }

    @Override
    @Transactional
    public void logout(String accessToken, String refreshToken, String reason) {
        String username = null;

        // Revocar el refresh token deja la sesión inservible de inmediato.
        if (refreshToken != null && !refreshToken.isBlank()) {
            refreshTokenRepository.findByToken(refreshToken).ifPresent(stored -> {
                stored.setRevoked(true);
                refreshTokenRepository.save(stored);
            });
        }

        // El access token puede haber vencido ya cuando se dispara el cierre por
        // inactividad; aun así se lee su jti para inscribirlo en la lista negra.
        if (accessToken != null && !accessToken.isBlank()) {
            try {
                Claims claims = tokenProvider.parseClaimsIgnoringExpiration(accessToken);
                String jti = claims.getId();
                username = claims.getSubject();

                if (jti != null && !revokedAccessTokenRepository.existsByJti(jti)) {
                    Instant expiresAt = claims.getExpiration() != null
                            ? claims.getExpiration().toInstant()
                            : Instant.now();
                    revokedAccessTokenRepository.save(new RevokedAccessToken(jti, username, expiresAt));
                }
            } catch (Exception ex) {
                // Un token ilegible o manipulado no impide cerrar la sesión.
                log.warn("No fue posible interpretar el access token durante el cierre de sesión: {}", ex.getMessage());
            }
        }

        log.info("Sesión cerrada para '{}' (motivo: {})", username != null ? username : "desconocido",
                reason != null ? reason : "manual");
    }

    private String issueRefreshToken(User user) {
        String value = tokenProvider.generateRefreshToken();
        refreshTokenRepository.save(new RefreshToken(value, user, tokenProvider.getRefreshTokenExpiration()));
        return value;
    }
}
