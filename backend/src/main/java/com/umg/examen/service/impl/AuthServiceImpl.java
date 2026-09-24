package com.umg.examen.service.impl;

import com.umg.examen.dto.request.LoginRequest;
import com.umg.examen.dto.response.AuthResponse;
import com.umg.examen.dto.response.UserResponse;
import com.umg.examen.entity.User;
import com.umg.examen.mapper.UserMapper;
import com.umg.examen.repository.UserRepository;
import com.umg.examen.security.JwtTokenProvider;
import com.umg.examen.security.TokenRevocationService;
import com.umg.examen.service.AuthService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final TokenRevocationService tokenRevocationService;

    public AuthServiceImpl(AuthenticationManager authenticationManager,
                           JwtTokenProvider tokenProvider,
                           UserRepository userRepository,
                           UserMapper userMapper,
                           TokenRevocationService tokenRevocationService) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.tokenRevocationService = tokenRevocationService;
    }

    @Override
    @Transactional(readOnly = true)
    public LoginResult login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String accessToken = tokenProvider.generateAccessToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(authentication.getName());

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + request.getUsername()));

        return new LoginResult(userMapper.toAuthResponse(user, accessToken), refreshToken);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse refreshAccessToken(String refreshToken) {
        if (!tokenProvider.validateRefreshToken(refreshToken)) {
            throw new BadCredentialsException("Refresh token inválido o expirado");
        }

        String tokenId = tokenProvider.getTokenId(refreshToken);
        if (tokenId == null || tokenRevocationService.isRevoked(tokenId)) {
            throw new BadCredentialsException("Refresh token revocado");
        }

        String username = tokenProvider.getUsernameFromJwt(refreshToken);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BadCredentialsException("Usuario del refresh token no encontrado"));

        List<String> roles = user.getRoles().stream()
                .map(role -> role.getName())
                .toList();
        String accessToken = tokenProvider.generateAccessTokenFromUsername(username, roles);
        return userMapper.toAuthResponse(user, accessToken);
    }

    @Override
    public void logout(String refreshToken, String reason) {
        String username = "desconocido";
        if (refreshToken != null && !refreshToken.isBlank() && tokenProvider.validateRefreshToken(refreshToken)) {
            String tokenId = tokenProvider.getTokenId(refreshToken);
            username = tokenProvider.getUsernameFromJwt(refreshToken);
            if (tokenId != null) {
                tokenRevocationService.revoke(tokenId, tokenProvider.getExpiration(refreshToken).toInstant());
            }
        }
        log.info("Cierre de sesión: usuario={}, motivo={}", username, reason);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));
        return userMapper.toResponse(user);
    }
}
