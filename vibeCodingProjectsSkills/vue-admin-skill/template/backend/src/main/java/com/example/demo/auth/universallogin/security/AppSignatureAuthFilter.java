package com.example.demo.auth.universallogin.security;

import com.example.demo.common.ApiResponse;
import com.example.demo.common.BusinessException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * 应用级签名鉴权过滤器：保护 {@code /api/open/**}。
 *
 * <p>★ 必须在宿主 {@code JwtAuthenticationFilter} **之前**注册
 * （见 {@code references/security-integration.md}）。</p>
 *
 * <p>职责：把「应用」认证为持有 {@code APP} 权限的调用主体，
 * 校验通过后把 {@link AppPrincipal} 放进 request attribute，
 * 供 Controller 用 {@code @RequestAttribute("appPrincipal")} 取用。</p>
 *
 * <p>失败时直接返回 {@code -1002} 信封，不进入业务层。</p>
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AppSignatureAuthFilter extends OncePerRequestFilter {

    /** request attribute key。 */
    public static final String ATTR_APP_PRINCIPAL = "appPrincipal";
    /** 开放接口前缀。 */
    public static final String OPEN_API_PREFIX = "/api/open/";
    /** 签名通过后授予的权限。 */
    public static final String AUTHORITY_APP = "APP";

    private final AppSignatureVerifier verifier;
    private final ObjectMapper objectMapper;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getRequestURI().startsWith(OPEN_API_PREFIX);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        try {
            AppPrincipal principal = verifier.verify(
                request.getHeader("X-App-Key"),
                request.getHeader("X-Timestamp"),
                request.getHeader("X-Nonce"),
                request.getMethod(),
                request.getRequestURI(),
                request.getHeader("X-Signature"));

            request.setAttribute(ATTR_APP_PRINCIPAL, principal);
            SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                    principal, null, List.of(new SimpleGrantedAuthority(AUTHORITY_APP))));

            chain.doFilter(request, response);
        } catch (BusinessException e) {
            SecurityContextHolder.clearContext();
            writeError(response, e);
        }
    }

    private void writeError(HttpServletResponse response, BusinessException e) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(objectMapper.writeValueAsString(
            ApiResponse.error(e.getCode(), e.getMessage())));
    }
}
