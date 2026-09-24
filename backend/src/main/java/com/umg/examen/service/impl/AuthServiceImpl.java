package com.umg.examen.service.impl;

import com.umg.examen.dto.request.LoginRequest;
import com.umg.examen.dto.request.LogoutRequest;
import com.umg.examen.dto.request.RefreshTokenRequest;
import com.umg.examen.dto.response.AuthResponse;
import com.umg.examen.dto.response.UserResponse;
import com.umg.examen.entity.Role;
import com.umg.examen.entity.User;
import com.umg.examen.exception.InvalidRefreshTokenException;
import com.umg.examen.mapper.UserMapper;
import com.umg.examen.repository.UserRepository;
import com.umg.examen.security.JwtTokenProvider;
import com.umg.examen.service.AuthService;
import com.umg.examen.service.RefreshTokenService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final RefreshTokenService refreshTokenService;

    public AuthServiceImpl(AuthenticationManager authenticationManager,
                           JwtTokenProvider tokenProvider,
                           UserRepository userRepository,
                           UserMapper userMapper,
                           RefreshTokenService refreshTokenService) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.refreshTokenService = refreshTokenService;
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

        String refreshToken = refreshTokenService.createRefreshToken(user);
        return userMapper.toAuthResponse(user, token, refreshToken, tokenProvider.getJwtExpirationMs());
    }

    @Override
    @Transactional(noRollbackFor = InvalidRefreshTokenException.class)
    public AuthResponse refresh(RefreshTokenRequest request) {
        // Valida contra la BD y revoca el refresh token usado (rotación)
        User user = refreshTokenService.verifyAndConsume(request.getRefreshToken());

        if (!Boolean.TRUE.equals(user.getEnabled())) {
            throw new InvalidRefreshTokenException("Usuario deshabilitado");
        }

        List<String> roles = user.getRoles().stream().map(Role::getName).collect(Collectors.toList());
        String newAccessToken = tokenProvider.generateTokenFromUsername(user.getUsername(), roles);
        String newRefreshToken = refreshTokenService.createRefreshToken(user);

        return userMapper.toAuthResponse(user, newAccessToken, newRefreshToken, tokenProvider.getJwtExpirationMs());
    }

    @Override
    @Transactional
    public void logout(LogoutRequest request) {
        String reason = request.getReason() != null ? request.getReason() : "manual";
        User user = refreshTokenService.revoke(request.getRefreshToken());
        if (user != null) {
            log.info("[LOGOUT] Sesión de '{}' cerrada (motivo: {}) — refresh token revocado en el servidor",
                    user.getUsername(), reason);
        } else {
            log.info("[LOGOUT] Logout recibido (motivo: {}) sin refresh token activo", reason);
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
