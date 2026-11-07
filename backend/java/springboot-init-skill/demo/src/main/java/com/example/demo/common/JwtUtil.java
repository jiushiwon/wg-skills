package com.example.demo.common;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * JWT 工具：签发与解析。
 */
@Slf4j
@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.access-expire-minutes:60}")
    private long accessExpireMinutes;

    @Value("${jwt.refresh-expire-days:7}")
    private long refreshExpireDays;

    @Value("${jwt.issuer:app}")
    private String issuer;

    private SecretKey key;

    @PostConstruct
    public void init() {
        byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException(
                "JWT_SECRET 长度不足 32 字节（" + bytes.length +
                " 字节），请使用至少 256 位随机密钥，例如：openssl rand -base64 32"
            );
        }
        this.key = Keys.hmacShaKeyFor(bytes);
    }

    public long getAccessExpireMinutes() {
        return accessExpireMinutes;
    }

    public String generateAccessToken(Long userId, String username) {
        return generateToken(userId, username, "access", accessExpireMinutes * 60 * 1000L);
    }

    public String generateRefreshToken(Long userId, String username) {
        return generateToken(userId, username, "refresh", refreshExpireDays * 24 * 60 * 60 * 1000L);
    }

    private String generateToken(Long userId, String username, String type, long ttlMillis) {
        long now = System.currentTimeMillis();
        Map<String, Object> claims = new HashMap<>();
        claims.put("uid", userId);
        claims.put("type", type);
        return Jwts.builder()
            .claims(claims)
            .subject(username)
            .issuer(issuer)
            .issuedAt(new Date(now))
            .expiration(new Date(now + ttlMillis))
            .signWith(key)
            .compact();
    }

    public Claims parse(String token) {
        return Jwts.parser()
            .verifyWith(key)
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    public Long getUserId(Claims claims) {
        Object uid = claims.get("uid");
        if (uid instanceof Number n) return n.longValue();
        return null;
    }

    public String getUsername(Claims claims) {
        return claims.getSubject();
    }

    public String getTokenType(Claims claims) {
        Object type = claims.get("type");
        return type == null ? "access" : type.toString();
    }
}