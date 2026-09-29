package com.example.demo.auth.universallogin.security;

import com.example.demo.common.BusinessException;
import com.example.demo.auth.universallogin.entity.App;
import com.example.demo.auth.universallogin.entity.AppKey;
import com.example.demo.auth.universallogin.repository.AppKeyRepository;
import com.example.demo.auth.universallogin.repository.AppRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.HexFormat;

/**
 * 应用级签名校验器：`/api/open/**` 的身份来源。
 *
 * <p>签名串（各段用 {@code \n} 连接，顺序不可变）：</p>
 * <pre>
 *   {apiKey}\n{timestamp}\n{nonce}\n{httpMethod}\n{requestPath}
 * </pre>
 * <p>算法：HmacSHA256(apiSecret, 签名串)，输出小写 hex。</p>
 *
 * <p>安全约束：</p>
 * <ul>
 *   <li>时间戳偏差超过 {@link #ALLOWED_SKEW_SECONDS} 秒直接拒绝（防重放）。</li>
 *   <li>apiKey 必须存在、status=1、未软删除。</li>
 *   <li>应用必须存在、status=1、未软删除。</li>
 *   <li>比较用 {@link java.security.MessageDigest#isEqual} 的等价常量时间实现，避免计时侧信道。</li>
 * </ul>
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AppSignatureVerifier {

    /** 允许的时间戳偏差（秒）。 */
    public static final long ALLOWED_SKEW_SECONDS = 300L;

    private static final String HMAC_SHA256 = "HmacSHA256";

    private final AppKeyRepository appKeyRepository;
    private final AppRepository appRepository;

    /**
     * 校验签名并返回调用主体。
     *
     * @throws BusinessException {@code -1002} 校验失败（未登录口径）；{@code -1003} 应用被禁用
     */
    public AppPrincipal verify(String apiKey, String timestamp, String nonce,
                               String httpMethod, String requestPath, String signature) {

        if (isBlank(apiKey) || isBlank(timestamp) || isBlank(nonce) || isBlank(signature)) {
            throw BusinessException.unauthorized("缺少应用签名头（X-App-Key / X-Timestamp / X-Nonce / X-Signature）");
        }

        long ts;
        try {
            ts = Long.parseLong(timestamp);
        } catch (NumberFormatException e) {
            throw BusinessException.unauthorized("X-Timestamp 非法");
        }
        long skew = Math.abs(Instant.now().getEpochSecond() - ts);
        if (skew > ALLOWED_SKEW_SECONDS) {
            throw BusinessException.unauthorized("请求已过期，时间戳偏差 " + skew + " 秒");
        }

        AppKey appKey = appKeyRepository.findByApiKeyAndStatusAndDeletedAtIsNull(apiKey, 1)
            .orElseThrow(() -> BusinessException.unauthorized("应用密钥无效或已禁用"));

        App app = appRepository.findByIdAndDeletedAtIsNull(appKey.getAppId())
            .orElseThrow(() -> BusinessException.unauthorized("应用不存在"));
        if (app.getStatus() == null || app.getStatus() != 1) {
            throw BusinessException.forbidden("应用已被禁用");
        }

        String payload = String.join("\n",
            apiKey, timestamp, nonce, httpMethod.toUpperCase(), requestPath);
        String expected = hmacHex(appKey.getApiSecret(), payload);

        if (!constantTimeEquals(expected, signature.toLowerCase())) {
            log.warn("应用签名校验失败 appId={} apiKey={}", app.getId(), apiKey);
            throw BusinessException.unauthorized("签名校验失败");
        }

        return new AppPrincipal(app.getId(), app.getOwnerId(), apiKey);
    }

    /** 供应用侧调试用的签名生成工具（同一算法，文档里给出）。 */
    public static String hmacHex(String secret, String payload) {
        try {
            Mac mac = Mac.getInstance(HMAC_SHA256);
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), HMAC_SHA256));
            return HexFormat.of().formatHex(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException("HMAC 计算失败", e);
        }
    }

    private static boolean constantTimeEquals(String a, String b) {
        byte[] x = a.getBytes(StandardCharsets.UTF_8);
        byte[] y = b.getBytes(StandardCharsets.UTF_8);
        return java.security.MessageDigest.isEqual(x, y);
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}
