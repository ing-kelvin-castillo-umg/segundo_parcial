package com.umg.examen.service.impl;

import com.umg.examen.dto.request.LoginRequest;
import com.umg.examen.dto.response.AuthResponse;
import com.umg.examen.dto.response.UserResponse;
import com.umg.examen.entity.User;
import com.umg.examen.mapper.UserMapper;
import com.umg.examen.repository.UserRepository;
import com.umg.examen.repository.UserSessionRepository;
import com.umg.examen.entity.UserSession;
import com.umg.examen.security.JwtTokenProvider;
import com.umg.examen.service.AuthService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final UserSessionRepository userSessionRepository;

    public AuthServiceImpl(AuthenticationManager authenticationManager,
                           JwtTokenProvider tokenProvider,
                           UserRepository userRepository,
                           UserMapper userMapper,
                           UserSessionRepository userSessionRepository) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.userSessionRepository = userSessionRepository;
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(authentication);

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + request.getUsername()));

        saveSession(user, refreshToken);
        return userMapper.toAuthResponse(user, token, refreshToken, tokenProvider.getAccessExpirationSeconds());
    }

    @Override
    @Transactional
    public AuthResponse refresh(String refreshToken) {
        if (!tokenProvider.isRefreshToken(refreshToken)) {
            throw new IllegalArgumentException("El refresh token no es válido o expiró");
        }

        String username = tokenProvider.getUsernameFromJwt(refreshToken);
        List<String> roles = tokenProvider.getRolesFromJwt(refreshToken);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));

        UserSession session = userSessionRepository.findByRefreshTokenHashAndRevokedAtIsNull(hashToken(refreshToken))
            .orElseThrow(() -> new IllegalArgumentException("La sesión no es válida o fue revocada"));
        if (session.getExpiresAt().isBefore(LocalDateTime.now())) {
            session.setRevokedAt(LocalDateTime.now());
            userSessionRepository.save(session);
            throw new IllegalArgumentException("El refresh token expiró");
        }

        String token = tokenProvider.generateTokenFromUsername(username, roles);
        String rotatedRefreshToken = tokenProvider.generateRefreshTokenFromUsername(username, roles);
        session.setRefreshTokenHash(hashToken(rotatedRefreshToken));
        session.setExpiresAt(LocalDateTime.now().plusSeconds(604800));
        userSessionRepository.save(session);
        return userMapper.toAuthResponse(user, token, rotatedRefreshToken, tokenProvider.getAccessExpirationSeconds());
    }

    @Override
    @Transactional
    public void logout(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) return;
        userSessionRepository.findByRefreshTokenHashAndRevokedAtIsNull(hashToken(refreshToken))
                .ifPresent(session -> {
                    session.setRevokedAt(LocalDateTime.now());
                    userSessionRepository.save(session);
                });
    }

    private void saveSession(User user, String refreshToken) {
        UserSession session = new UserSession();
        session.setSessionId(UUID.randomUUID().toString());
        session.setUser(user);
        session.setRefreshTokenHash(hashToken(refreshToken));
        session.setExpiresAt(LocalDateTime.now().plusSeconds(604800));
        userSessionRepository.save(session);
    }

    private String hashToken(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.UTF_8));
            StringBuilder hash = new StringBuilder();
            for (byte value : digest) hash.append(String.format("%02x", value));
            return hash.toString();
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("No se pudo proteger el refresh token", exception);
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
