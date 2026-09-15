package com.example.demo.service;

import com.example.demo.common.BusinessException;
import com.example.demo.common.JwtUtil;
import com.example.demo.dto.auth.LoginRequest;
import com.example.demo.dto.auth.RegisterRequest;
import com.example.demo.dto.auth.TokenResponse;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional
    public TokenResponse register(RegisterRequest req) {
        if (userRepository.existsByUsername(req.getUsername())) {
            throw BusinessException.conflict("用户名已存在");
        }
        User u = User.builder()
            .username(req.getUsername())
            .password(passwordEncoder.encode(req.getPassword()))
            .nickname(req.getNickname())
            .email(req.getEmail())
            .phone(req.getPhone())
            .build();
        userRepository.save(u);
        return generateTokens(u);
    }

    @Transactional(readOnly = true)
    public TokenResponse login(LoginRequest req) {
        User u = userRepository.findByUsername(req.getUsername())
            .orElseThrow(() -> BusinessException.badRequest("用户名或密码错误"));
        if (!passwordEncoder.matches(req.getPassword(), u.getPassword())) {
            throw BusinessException.badRequest("用户名或密码错误");
        }
        return generateTokens(u);
    }

    @Transactional(readOnly = true)
    public TokenResponse refresh(String refreshToken) {
        try {
            Claims claims = jwtUtil.parse(refreshToken);
            if (!"refresh".equals(jwtUtil.getTokenType(claims))) {
                throw BusinessException.badRequest("非 refresh token");
            }
            Long userId = jwtUtil.getUserId(claims);
            User u = userRepository.findById(userId)
                .orElseThrow(() -> BusinessException.unauthorized("用户不存在"));
            return generateTokens(u);
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw BusinessException.unauthorized("刷新令牌无效或已过期");
        }
    }

    private TokenResponse generateTokens(User u) {
        String access = jwtUtil.generateAccessToken(u.getId(), u.getUsername());
        String refresh = jwtUtil.generateRefreshToken(u.getId(), u.getUsername());
        long expiresIn = jwtUtil.getAccessExpireMinutes() * 60;
        return new TokenResponse(access, refresh, "Bearer", (int) expiresIn);
    }
}