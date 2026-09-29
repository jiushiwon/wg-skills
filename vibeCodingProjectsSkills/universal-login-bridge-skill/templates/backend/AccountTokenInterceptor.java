// Derived from: universal-login-bridge-skill/templates/backend/AccountTokenInterceptor.java
//
// 接入侧身份校验模板 —— 对齐 universal-login-api 2026-09-28 版设计。
//
// 放在接入项目（若为 Spring Boot）的 config/ 或 common/ 下。
//
// 账户体系提供**两种**证明身份的方式，接入方按场景二选一或并用：
//
//   方式 A：宿主 JWT + @CurrentUser（代表"某个用户"，调宿主侧接口）
//     - 接入项目与宿主共享 jwt.secret / jwt.issuer（同一签发者），
//       直接复用宿主骨架的 JwtAuthenticationFilter 与 @CurrentUser 参数解析器；
//       控制器方法签名写 @CurrentUser Long userId，禁止自己 new 一个 userId。
//     - 若接入项目没引宿主骨架，可用本类把 userId 注入请求属性（见下方 doFilterInternal）。
//
//   方式 B：应用级 HmacSHA256 签名（代表"某个应用"，调 /api/open/**）
//     - server-to-server 场景，用 api_key + api_secret 签名，见本类 signHeaders()。
//
// 职责边界（重要）：
//   - 本类只做「验签 + 取 userId + 注入上下文」或「生成签名头」
//   - 不签发 token、不校验密码、不查用户表 —— 那些都在账户体系侧
//   - 不得出现硬编码用户（如 Long userId = 1L）
package com.example.demo.config;

import com.example.demo.common.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Map;

/**
 * 接入侧身份工具：方式 A（宿主 JWT → userId 上下文）+ 方式 B（应用级 HMAC 签名）。
 *
 * <p>★ 若接入项目本身就用了宿主骨架（<code>springboot-init-skill</code>），请**直接**在 Controller 里用
 * {@code @CurrentUser Long userId}，不要再引本类 —— 参数解析器已由宿主提供。</p>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AccountTokenInterceptor extends OncePerRequestFilter {

    /** 请求属性名：若未使用宿主 @CurrentUser 解析器，Controller 可用 @RequestAttribute 取 */
    public static final String ATTR_USER_ID = "ctxUserId";
    public static final String ATTR_USERNAME = "ctxUsername";

    private static final String HEADER = "Authorization";
    private static final String PREFIX = "Bearer ";

    /** 开放接口前缀：这些路径走应用级签名，不走宿主 JWT。 */
    private static final String OPEN_API_PREFIX = "/api/open/";

    private final JwtUtil jwtUtil;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest req) {
        // /api/open/** 由账户体系的 AppSignatureAuthFilter 处理（X-App-Key 等 4 个签名头），
        // 接入方无需在此解析 JWT。
        return req.getRequestURI().startsWith(OPEN_API_PREFIX);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest req,
                                    HttpServletResponse res,
                                    FilterChain chain) throws ServletException, IOException {
        String header = req.getHeader(HEADER);

        // 无 token：不拦截，交给下游的鉴权规则决定是否放行（公开接口要能过）
        if (header == null || !header.startsWith(PREFIX)) {
            chain.doFilter(req, res);
            return;
        }

        String token = header.substring(PREFIX.length()).trim();
        try {
            Long userId = jwtUtil.getUserId(token);
            String username = jwtUtil.getUsername(token);
            req.setAttribute(ATTR_USER_ID, userId);
            req.setAttribute(ATTR_USERNAME, username);
        } catch (Exception e) {
            // 验签失败 / 过期：不抛异常，交由 SecurityConfig 的规则返回 HTTP 401 / code=-1002
            log.debug("[AccountTokenInterceptor] token 校验失败: {}", e.getMessage());
        }

        chain.doFilter(req, res);
    }

    // ==================== 方式 B：应用级 HmacSHA256 签名 ====================

    /** 允许的时间戳偏差（秒），与账户体系一致。 */
    public static final long ALLOWED_SKEW_SECONDS = 300L;

    private static final String HMAC_SHA256 = "HmacSHA256";

    /**
     * 生成调用 /api/open/** 所需的 4 个签名头。
     *
     * <pre>
     *   签名串 = {apiKey}\n{timestamp}\n{nonce}\n{HTTP_METHOD}\n{requestPath}
     *   签名   = hex( HmacSHA256(apiSecret, 签名串) )     // 小写 hex
     * </pre>
     *
     * @param apiKey      密钥的 api_key（公开标识）
     * @param apiSecret   密钥的 api_secret（仅创建密钥时返回一次，放服务端环境变量）
     * @param httpMethod  GET / POST
     * @param requestPath 不含 query string 的路径，如 /api/open/userinfo
     */
    public static Map<String, String> signHeaders(String apiKey, String apiSecret,
                                                 String httpMethod, String requestPath) {
        String timestamp = String.valueOf(Instant.now().getEpochSecond());
        byte[] nonceBytes = new byte[8];
        new SecureRandom().nextBytes(nonceBytes);
        String nonce = HexFormat.of().formatHex(nonceBytes);

        String payload = String.join("\n", apiKey, timestamp, nonce,
            httpMethod.toUpperCase(), requestPath);
        String signature = hmacHex(apiSecret, payload);

        return Map.of(
            "X-App-Key", apiKey,
            "X-Timestamp", timestamp,
            "X-Nonce", nonce,
            "X-Signature", signature
        );
    }

    /** HMAC-SHA256 → 小写 hex（与账户体系 AppSignatureVerifier.hmacHex 同算法）。 */
    public static String hmacHex(String secret, String payload) {
        try {
            Mac mac = Mac.getInstance(HMAC_SHA256);
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), HMAC_SHA256));
            return HexFormat.of().formatHex(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException("HMAC 计算失败", e);
        }
    }
}

/*
 * ------------------------------------------------------------------
 * 使用示例 1：调用宿主侧接口（方式 A，代表某个用户）
 * ------------------------------------------------------------------
 *
 * @RestController
 * @RequestMapping("/api/notes")
 * public class NoteController {
 *
 *     @GetMapping
 *     public ApiResponse<List<Note>> list(@CurrentUser Long userId) {   // ★ 宿主骨架提供
 *         return ApiResponse.success(noteRepository.findByUserId(userId));
 *     }
 * }
 *
 * ★ 禁止写成： Long userId = 1L;  —— 那会让任意登录用户看到同一个人的数据。
 *
 * ------------------------------------------------------------------
 * 使用示例 2：调用开放接口（方式 B，代表某个应用）
 * ------------------------------------------------------------------
 *
 * Map<String, String> headers = AccountTokenInterceptor.signHeaders(
 *     apiKey, apiSecret, "POST", "/api/open/bind/apply");
 * // 再把 headers 塞进 RestTemplate / WebClient 的请求头，body 传 { appUserId, appUserName }
 *
 * 注意：requestPath 不含 query string；时间戳偏差超过 300 秒会被账户体系拒绝。
 *
 * ------------------------------------------------------------------
 * 与账户体系对接的两种方式（对应上方 A / B）
 * ------------------------------------------------------------------
 *
 * 方式 A：共享 JWT_SECRET（同域、同一签发者）
 *   application.yml:
 *     jwt:
 *       secret: ${JWT_SECRET:}              # 与账户体系保持完全一致
 *       issuer: ${JWT_ISSUER:vue-admin}     # 与账户体系保持完全一致
 *   好处：接入方不调任何 HTTP 即可解出身份
 *   代价：secret 泄露影响面扩大，仅适合同一运维域
 *
 * 方式 A'：不共享密钥，改调账户体系接口校验（跨域、跨团队）
 *   GET /api/auth/me  (Authorization: Bearer <token>)
 *     → 200 且 code === 0    → 身份有效
 *     → 401 或 code === -1002 → 身份失效
 *   好处：secret 不扩散
 *   代价：每次请求多一跳（建议本地缓存 userId → 有效期至 token 过期）
 *
 * 方式 B：应用级签名（服务器对服务器）
 *   见 signHeaders()；密钥只在服务端环境变量，禁止进入前端 / 日志 / 仓库。
 *
 * ------------------------------------------------------------------
 * 接入自检
 * ------------------------------------------------------------------
 * [ ] 没有在本项目里 new 用户表 / 角色表 / 存密码
 * [ ] 没有自己实现密码加密与 token 签发
 * [ ] 没有硬编码用户（grep -rn "1L" src/ 无命中）
 * [ ] 鉴权失效返回的是 HTTP 401 或 code === -1002（与契约一致）
 * [ ] token 从 Header 取，不从 query / body 取
 * [ ] api_secret 只从环境变量读，未出现在代码 / 日志里
 */
