// Derived from springboot-auth-module-skill/references/skeleton.md §6
// Local change: 装配真实权限（历史版本只装 ROLE_USER，导致 @PreAuthorize 全员 403）
// See vue-admin-skill/template/backend/README.md#provenance
package com.example.demo.common;

import com.example.demo.auth.permission.AuthorityLoader;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * JWT 鉴权拦截器。
 *
 * <p>★ 关键：必须把用户的**真实权限标识**与**角色码**一并装进 SecurityContext。
 * 只装 {@code ROLE_USER} 会导致所有 {@code hasAuthority('xxx')} 判断失败，
 * 表现为"补了 @PreAuthorize 反而全员 403"。</p>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final AuthorityLoader authorityLoader;

    @Value("${jwt.header:Authorization}")
    private String header;

    @Value("${jwt.prefix:Bearer }")
    private String prefix;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader(header);
        if (authHeader != null && authHeader.startsWith(prefix)) {
            String token = authHeader.substring(prefix.length());
            try {
                Claims claims = jwtUtil.parse(token);
                String type = jwtUtil.getTokenType(claims);
                if (!"access".equals(type)) {
                    log.warn("非 access token, type={}", type);
                } else {
                    Long userId = jwtUtil.getUserId(claims);

                    List<GrantedAuthority> authorities = new ArrayList<>();
                    // 角色码 → ROLE_xxx（供 hasRole/hasAuthority('ROLE_xxx') 使用）
                    authorityLoader.roleCodes(userId)
                        .forEach(c -> authorities.add(new SimpleGrantedAuthority("ROLE_" + c)));
                    // 真实权限标识 → 供 hasAuthority('system:user:list') 使用
                    authorityLoader.permissions(userId)
                        .forEach(p -> authorities.add(new SimpleGrantedAuthority(p)));

                    var auth = new UsernamePasswordAuthenticationToken(userId, null, authorities);
                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            } catch (Exception e) {
                log.warn("JWT 解析失败: {}", e.getMessage());
                SecurityContextHolder.clearContext();
            }
        }
        filterChain.doFilter(request, response);
    }
}
