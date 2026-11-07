package com.example.demo.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;

/**
 * 请求日志过滤器：记录方法、路径、状态码、耗时。
 *
 * <p>自动跳过包含敏感关键字的路径（auth/password/token 等），避免日志泄露凭证。 ponytail:
 * 若需全链路追踪，可在此注入 MDC traceId。
 */
@Slf4j
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
public class LoggingFilter extends OncePerRequestFilter {

    private static final Set<String> SENSITIVE_KEYWORDS = Set.of("auth", "password", "token", "login", "register");

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        long start = System.currentTimeMillis();
        String uri = request.getRequestURI();
        String method = request.getMethod();

        try {
            filterChain.doFilter(request, response);
        } finally {
            long cost = System.currentTimeMillis() - start;
            int status = response.getStatus();
            if (isSensitive(uri)) {
                log.info("[请求] {} {} {} {}ms (敏感路径已脱敏)", method, uri, status, cost);
            } else {
                log.info("[请求] {} {} {} {}ms", method, uri, status, cost);
            }
        }
    }

    private boolean isSensitive(String uri) {
        String lower = uri.toLowerCase();
        return SENSITIVE_KEYWORDS.stream().anyMatch(lower::contains);
    }
}
