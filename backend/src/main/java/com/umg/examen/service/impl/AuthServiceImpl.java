package com.umg.examen.service.impl;

import com.umg.examen.dto.request.LoginRequest;
import com.umg.examen.dto.request.RefreshTokenRequest;
import com.umg.examen.dto.response.AuthResponse;
import com.umg.examen.dto.response.UserResponse;
import com.umg.examen.entity.User;
import com.umg.examen.mapper.UserMapper;
import com.umg.examen.repository.UserRepository;
import com.umg.examen.security.JwtTokenProvider;
import com.umg.examen.service.AuthService;
import com.umg.examen.service.RefreshTokenService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements AuthService {

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
        String accessToken = tokenProvider.generateToken(authentication);

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + request.getUsername()));

        RefreshTokenService.IssuedRefreshToken refreshToken = refreshTokenService.issue(user);

        return userMapper.toAuthResponse(
                user,
                accessToken,
                refreshToken.value(),
                tokenProvider.getExpirationSeconds(),
                refreshToken.expiresInSeconds()
        );
    }

    @Override
    @Transactional
    public AuthResponse refresh(RefreshTokenRequest request) {
        RefreshTokenService.RotatedRefreshToken rotatedToken =
                refreshTokenService.rotate(request.getRefreshToken());
        User user = rotatedToken.user();
        var roles = user.getRoles().stream().map(role -> role.getName()).toList();
        String accessToken = tokenProvider.generateTokenFromUsername(user.getUsername(), roles);

        return userMapper.toAuthResponse(
                user,
                accessToken,
                rotatedToken.value(),
                tokenProvider.getExpirationSeconds(),
                rotatedToken.expiresInSeconds()
        );
    }

    @Override
    @Transactional
    public void logout(RefreshTokenRequest request) {
        refreshTokenService.revoke(request.getRefreshToken());
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));
        return userMapper.toResponse(user);
    }
}
