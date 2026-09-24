package com.umg.examen.service.impl;

import com.umg.examen.dto.request.LoginRequest;
import com.umg.examen.dto.response.AuthResponse;
import com.umg.examen.dto.response.UserResponse;
import com.umg.examen.entity.User;
import com.umg.examen.entity.RefreshToken;
import com.umg.examen.mapper.UserMapper;
import com.umg.examen.repository.RefreshTokenRepository;
import com.umg.examen.repository.UserRepository;
import com.umg.examen.security.InvalidRefreshTokenException;
import com.umg.examen.security.JwtTokenProvider;
import com.umg.examen.security.TokenBlacklist;
import com.umg.examen.service.AuthService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;

@Service
public class AuthServiceImpl implements AuthService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final RefreshTokenRepository refreshTokenRepository;
    private final TokenBlacklist tokenBlacklist;

    @Value("${app.jwt.refresh-expiration-ms:604800000}")
    private long refreshExpirationMs;

    public AuthServiceImpl(AuthenticationManager authenticationManager,
                           JwtTokenProvider tokenProvider,
                           UserRepository userRepository,
                           UserMapper userMapper,
                           RefreshTokenRepository refreshTokenRepository,
                           TokenBlacklist tokenBlacklist) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.refreshTokenRepository = refreshTokenRepository;
        this.tokenBlacklist = tokenBlacklist;
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

        return buildAuthResponse(user, token, issueRefreshToken(user));
    }

    @Override
    @Transactional
    public AuthResponse refresh(String rawRefreshToken) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            throw new InvalidRefreshTokenException();
        }

        RefreshToken stored = refreshTokenRepository.findByTokenHash(hash(rawRefreshToken))
                .orElseThrow(InvalidRefreshTokenException::new);
        if (stored.isRevoked() || !stored.getExpiresAt().isAfter(Instant.now())) {
            throw new InvalidRefreshTokenException();
        }

        User user = stored.getUser();
        if (!Boolean.TRUE.equals(user.getEnabled())) {
            throw new InvalidRefreshTokenException();
        }

        stored.setRevoked(true);
        List<String> roles = user.getRoles().stream().map(role -> role.getName()).toList();
        String accessToken = tokenProvider.generateTokenFromUsername(user.getUsername(), roles);
        return buildAuthResponse(user, accessToken, issueRefreshToken(user));
    }

    @Override
    @Transactional
    public void logout(String accessToken, String rawRefreshToken) {
        if (accessToken != null && !accessToken.isBlank()) {
            tokenBlacklist.invalidate(accessToken);
        }
        if (rawRefreshToken != null && !rawRefreshToken.isBlank()) {
            refreshTokenRepository.findByTokenHash(hash(rawRefreshToken))
                    .ifPresent(stored -> stored.setRevoked(true));
        }
    }

    private AuthResponse buildAuthResponse(User user, String accessToken, String refreshToken) {
        AuthResponse response = userMapper.toAuthResponse(user, accessToken);
        response.setRefreshToken(refreshToken);
        response.setAccessTokenExpiresInMs(tokenProvider.getExpirationMs());
        return response;
    }

    private String issueRefreshToken(User user) {
        byte[] randomBytes = new byte[32];
        SECURE_RANDOM.nextBytes(randomBytes);
        String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);

        RefreshToken stored = new RefreshToken();
        stored.setUser(user);
        stored.setTokenHash(hash(rawToken));
        stored.setExpiresAt(Instant.now().plusMillis(refreshExpirationMs));
        stored.setRevoked(false);
        refreshTokenRepository.save(stored);
        return rawToken;
    }

    private String hash(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 no está disponible", ex);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));
        return userMapper.toResponse(user);
    }
}
