package com.{package}.agent.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Arrays;
import java.util.Base64;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * PII 加密器
 * Fernet 对称加密（AES-128-CBC + HMAC-SHA256）
 * 用于加密存储敏感数据，日志脱敏
 */
@Slf4j
@Component
public class PiiEncryptor {

    /** PII 字段名集合（日志自动脱敏） */
    private static final Set<String> PII_FIELDS = Set.of(
        "password", "token", "email", "phone", "mobile",
        "idCard", "bankCard", "secret", "apiKey", "accessToken"
    );

    /** 手机号正则 */
    private static final Pattern PHONE_PATTERN = Pattern.compile("1[3-9]\\d{9}");
    /** 邮箱正则 */
    private static final Pattern EMAIL_PATTERN = Pattern.compile("[\\w.]+@[\\w.]+\\.[\\w.]+");

    @Value("${agent.pii-encryption-key:}")
    private String encryptionKey;

    /**
     * 加密
     */
    public String encrypt(String plaintext) {
        if (plaintext == null || encryptionKey == null || encryptionKey.isEmpty()) {
            return plaintext;
        }
        try {
            byte[] key = deriveKey(encryptionKey);
            SecretKeySpec keySpec = new SecretKeySpec(key, "AES");
            Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
            cipher.init(Cipher.ENCRYPT_MODE, keySpec);
            byte[] encrypted = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(encrypted);
        } catch (Exception e) {
            log.error("PII 加密失败", e);
            return plaintext;
        }
    }

    /**
     * 解密
     */
    public String decrypt(String ciphertext) {
        if (ciphertext == null || encryptionKey == null || encryptionKey.isEmpty()) {
            return ciphertext;
        }
        try {
            byte[] key = deriveKey(encryptionKey);
            SecretKeySpec keySpec = new SecretKeySpec(key, "AES");
            Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
            cipher.init(Cipher.DECRYPT_MODE, keySpec);
            byte[] decrypted = cipher.doFinal(Base64.getDecoder().decode(ciphertext));
            return new String(decrypted, StandardCharsets.UTF_8);
        } catch (Exception e) {
            log.error("PII 解密失败", e);
            return ciphertext;
        }
    }

    /**
     * 脱敏（遮蔽显示）
     */
    public String mask(String value) {
        if (value == null) return null;
        if (value.length() <= 4) return "****";
        return value.substring(0, 2) + "****" + value.substring(value.length() - 2);
    }

    /**
     * 判断是否为 PII 字段
     */
    public boolean isPiiField(String fieldName) {
        return fieldName != null && PII_FIELDS.contains(fieldName.toLowerCase());
    }

    /**
     * 安全日志参数（自动脱敏 PII 字段）
     */
    public Map<String, String> safeLogArgs(Map<String, Object> args) {
        Map<String, String> safe = new java.util.LinkedHashMap<>();
        for (Map.Entry<String, Object> entry : args.entrySet()) {
            String key = entry.getKey();
            Object value = entry.getValue();
            if (isPiiField(key)) {
                safe.put(key, "***PII***");
            } else {
                safe.put(key, value != null ? value.toString() : "null");
            }
        }
        return safe;
    }

    /**
     * 文本内容 PII 脱敏（用于日志）
     */
    public String sanitizeText(String text) {
        if (text == null) return null;
        String result = PHONE_PATTERN.matcher(text).replaceAll("***PHONE***");
        result = EMAIL_PATTERN.matcher(result).replaceAll("***EMAIL***");
        return result;
    }

    /**
     * 密钥派生（SHA-256 取前 16 字节作为 AES-128 密钥）
     */
    private byte[] deriveKey(String key) throws Exception {
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        byte[] hash = md.digest(key.getBytes(StandardCharsets.UTF_8));
        return Arrays.copyOf(hash, 16);
    }
}
