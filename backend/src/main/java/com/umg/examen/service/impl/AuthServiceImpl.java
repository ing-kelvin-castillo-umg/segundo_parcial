package com.umg.examen.service.impl;

import com.umg.examen.dto.request.LoginRequest;
import com.umg.examen.dto.response.AuthResponse;
import com.umg.examen.dto.response.UserResponse;
import com.umg.examen.entity.RefreshToken;
import com.umg.examen.entity.User;
import com.umg.examen.mapper.UserMapper;
import com.umg.examen.repository.RefreshTokenRepository;
import com.umg.examen.repository.UserRepository;
import com.umg.examen.security.JwtTokenProvider;
import com.umg.examen.service.AuthService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserMapper userMapper;

    @Value("${app.auth.refresh-expiration-ms}")
    private long refreshTokenExpirationMs;

    public AuthServiceImpl(AuthenticationManager authenticationManager,
                           JwtTokenProvider tokenProvider,
                           UserRepository userRepository,
                           RefreshTokenRepository refreshTokenRepository,
                           UserMapper userMapper) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
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

        return userMapper.toAuthResponse(user, token, createRefreshToken(user));
    }

    @Override
    @Transactional
    public AuthResponse refresh(String refreshTokenValue) {
        RefreshToken refreshToken = refreshTokenRepository.findByTokenAndRevokedFalse(refreshTokenValue)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token inválido o revocado"));

        if (refreshToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            refreshToken.setRevoked(true);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token expirado");
        }

        refreshToken.setRevoked(true);
        User user = refreshToken.getUser();
        String accessToken = tokenProvider.generateTokenFromUsername(
                user.getUsername(),
                user.getRoles().stream().map(role -> role.getName()).toList()
        );

        return userMapper.toAuthResponse(user, accessToken, createRefreshToken(user));
    }

    @Override
    @Transactional
    public void logout(String refreshTokenValue) {
        refreshTokenRepository.findByToken(refreshTokenValue)
                .ifPresent(refreshToken -> refreshToken.setRevoked(true));
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));
        return userMapper.toResponse(user);
    }

    private String createRefreshToken(User user) {
        RefreshToken refreshToken = new RefreshToken();
        String token = UUID.randomUUID() + "-" + UUID.randomUUID();
        refreshToken.setToken(token);
        refreshToken.setUser(user);
        refreshToken.setExpiresAt(LocalDateTime.now().plusNanos(refreshTokenExpirationMs * 1_000_000));
        refreshTokenRepository.save(refreshToken);
        return token;
    }
}
