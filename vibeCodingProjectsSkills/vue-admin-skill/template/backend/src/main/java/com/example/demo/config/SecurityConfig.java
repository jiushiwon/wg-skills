// Derived from springboot-auth-module-skill/references/skeleton.md §7
// Local change: 开启方法级鉴权；收紧 /api/auth/** 的 permitAll（只放行 login/refresh）
// See vue-admin-skill/template/backend/README.md#provenance
package com.example.demo.config;

import com.example.demo.auth.universallogin.security.AppSignatureAuthFilter;
import com.example.demo.common.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Spring Security 6 配置：JWT 鉴权 + 方法级鉴权 + 安全头 + CORS。
 *
 * <p>★ 两处必须存在：</p>
 * <ol>
 *   <li>{@code @EnableMethodSecurity} —— 不开则所有 {@code @PreAuthorize} 静默失效；</li>
 *   <li>{@code JwtAuthenticationFilter} 装配真实权限 —— 只装 ROLE_USER 会导致全员 403。</li>
 * </ol>
 */
@Configuration
@EnableMethodSecurity          // ← 不开则 @PreAuthorize 静默失效
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;
    private final AppSignatureAuthFilter appSignatureFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(c -> c.configurationSource(corsConfigurationSource()))
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .headers(h -> h
                .frameOptions(f -> f.deny())
                .contentTypeOptions(c -> {})
                .xssProtection(x -> {})
                .httpStrictTransportSecurity(hsts -> hsts
                    .includeSubDomains(true)
                    .maxAgeInSeconds(31536000))
            )
            .authorizeHttpRequests(auth -> auth
                // 公共端点：只放行登录/刷新/健康检查/Swagger/静态资源
                .requestMatchers(HttpMethod.GET, "/api/health").permitAll()
                .requestMatchers("/api/auth/login", "/api/auth/refresh").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
                .requestMatchers("/uploads/**").permitAll()
                // 开放接口（universal-login-api）：不是 permitAll，要求应用签名过滤器授予的 APP 权限
                .requestMatchers("/api/open/**").hasAuthority("APP")
                // ⚠️ 以下端点**禁止** permitAll（历史缺陷：放行后未登录可读他人绑定、改他人应用）
                // /api/apps/**  /api/bind/**  /api/users/**  /api/roles/**  /api/menus/**
                // /api/orgs/**  /api/posts/**  /api/tenants/**  /api/products/**
                .anyRequest().authenticated()
            )
            .addFilterBefore(appSignatureFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOriginPatterns(List.of("*"));
        cfg.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        cfg.setAllowedHeaders(List.of("*"));
        cfg.setAllowCredentials(true);
        cfg.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }
}
