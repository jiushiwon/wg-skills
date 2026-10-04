// Derived from springboot-auth-module-skill/references/skeleton.md §6
// Local change: 装配真实权限（历史版本只装 ROLE_USER，导致 @PreAuthorize 全员 403）
// See vue-admin-skill/template/backend/README.md#provenance
package com.example.demo.common;

import com.example.demo.auth.common.AuthPerms;
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
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

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

    /**
     * 反射读取 AuthPerms 的所有 public static final String 字段。
     * 编译期 inline → 反射读到的是 run-time 的字面量值。
     * 返回去重 Set，避免 super_admin 短路时重复装 41 个。
     * 性能：每个请求调用一次，反射开销约 5μs，比"DB 查 super_admin 应有权限"（50ms+）低 4 个数量级。
     */
    private static volatile Set<String> ALL_PERMS_CACHE;
    private static Set<String> allAuthPerms() {
        if (ALL_PERMS_CACHE != null) return ALL_PERMS_CACHE;
        synchronized (JwtAuthenticationFilter.class) {
            if (ALL_PERMS_CACHE != null) return ALL_PERMS_CACHE;
            Set<String> set = new HashSet<>();
            for (Field f : AuthPerms.class.getDeclaredFields()) {
                int mod = f.getModifiers();
                if (java.lang.reflect.Modifier.isPublic(mod)
                        && java.lang.reflect.Modifier.isStatic(mod)
                        && java.lang.reflect.Modifier.isFinal(mod)
                        && f.getType() == String.class) {
                    try {
                        String v = (String) f.get(null);
                        if (v != null && v.matches("^[a-z][a-z0-9_]*:[a-z][a-z0-9_]*:[a-z][a-z0-9_-]+$")) {
                            set.add(v);
                        }
                    } catch (IllegalAccessException ignored) {}
                }
            }
            ALL_PERMS_CACHE = Collections.unmodifiableSet(set);
            return ALL_PERMS_CACHE;
        }
    }

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
                    List<String> roles = authorityLoader.roleCodes(userId);
                    // 角色码 → ROLE_xxx（供 hasRole/hasAuthority('ROLE_xxx') 使用）
                    roles.forEach(c -> authorities.add(new SimpleGrantedAuthority("ROLE_" + c)));
                    // 真实权限标识 → 供 hasAuthority('system:user:list') 使用
                    Set<String> perms = authorityLoader.permissions(userId);
                    perms.forEach(p -> authorities.add(new SimpleGrantedAuthority(p)));
                    // ★ super_admin 短路：检测到 super_admin 角色码 → 自动装全部 41 个 AuthPerms 权限码，
                    //   避免 "DB 没建 tenant 菜单 → super_admin 没绑 tenant 权限 → 403" 的死循环。
                    //   用反射遍历 AuthPerms 的静态字符串字段（编译期 inline 常量），运行期只读一次。
                    if (roles.contains("super_admin")) {
                        for (String perm : allAuthPerms()) {
                            authorities.add(new SimpleGrantedAuthority(perm));
                        }
                        log.debug("【super_admin 短路】userId={} 已装全部 AuthPerms", userId);
                    }

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
