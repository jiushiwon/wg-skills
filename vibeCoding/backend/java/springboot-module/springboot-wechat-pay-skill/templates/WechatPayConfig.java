package com.example.pay.wechat.config;

import com.wechat.pay.java.core.Config;
import com.wechat.pay.java.core.RSAAutoCertificateConfig;
import com.wechat.pay.java.core.exception.ValidationException;
import com.wechat.pay.java.core.notification.NotificationConfig;
import com.wechat.pay.java.core.util.PemUtil;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.PrivateKey;
import java.security.cert.X509Certificate;

/**
 * 微信支付 V3 配置
 * 重要：所有参数必须从商户平台获取，详见 references/merchant-onboarding.md
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "wechat.pay")
public class WechatPayConfig {

    /** 公众号 / 小程序 / 移动应用 appId */
    private String appId;

    /** 商户号（10 位数字） */
    private String mchId;

    /** 商户私钥文件路径（apiclient_key.pem） */
    private String privateKeyPath;

    /** 商户证书文件路径（apiclient_cert.pem） */
    private String merchantCertPath;

    /** 商户证书序列号（32 位十六进制） */
    private String apiCertSerialNo;

    /** APIv3 密钥（32 位字符串，用于回调解密） */
    private String apiV3Key;

    /** 支付回调地址 */
    private String notifyUrl;

    /** 退款回调地址（默认复用 notifyUrl） */
    private String refundNotifyUrl;

    /** HTTP 连接超时（毫秒） */
    private Integer connectTimeoutMs = 5000;

    /** HTTP 读取超时（毫秒） */
    private Integer readTimeoutMs = 10000;

    /**
     * 微信支付 V3 客户端（自动下载并刷新平台证书）
     */
    @Bean
    public Config wechatPayConfig() throws IOException {
        // 1. 加载商户私钥
        PrivateKey merchantPrivateKey = PemUtil.loadPrivateKeyFromFile(privateKeyPath);

        // 2. 加载商户证书（用于 TLS 双向认证）
        X509Certificate merchantCertificate = PemUtil.loadCertificateFromFile(merchantCertPath);

        // 3. 用 RSAAutoCertificateConfig（自动下载微信平台证书 + 定时刷新）
        //    推荐使用，自动处理平台证书过期
        return new RSAAutoCertificateConfig.Builder()
            .merchantId(mchId)
            .merchantSerialNumber(apiCertSerialNo)
            .privateKey(merchantPrivateKey)
            .merchantCertificate(merchantCertificate)
            .apiV3Key(apiV3Key)
            .connectTimeoutMs(connectTimeoutMs)
            .readTimeoutMs(readTimeoutMs)
            .build();
    }

    /**
     * 回调验签配置（使用 APIv3 密钥 + 商户平台证书）
     */
    @Bean
    public NotificationConfig notificationConfig(Config config) {
        return new NotificationConfig.Builder()
            .apiV3Key(apiV3Key)
            .certificates(config.getVerifier().getValidCertificates())
            .build();
    }
}
