package com.example.pay.alipay.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * 支付宝支付配置
 * 对应 application-alipay.yml 中的 alipay.* 配置
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "alipay")
public class AlipayPayConfig {

    /** 应用 APPID（16 位数字） */
    private String appId;

    /** 应用私钥（PEM PKCS8 完整内容，含 BEGIN/END 头） */
    private String privateKey;

    /** 支付宝公钥（**不是应用公钥**） */
    private String alipayPublicKey;

    /** 网关：生产 https://openapi.alipay.com/gateway.do */
    private String gatewayUrl;

    /** 支付回调地址（公网可访问） */
    private String notifyUrl;

    /** 支付完成后跳转地址 */
    private String returnUrl;

    /** 签名方式：固定 RSA2 */
    private String signType = "RSA2";

    /** 字符编码 */
    private String charset = "UTF-8";

    /** 数据格式 */
    private String format = "json";

    /** 沙箱模式 */
    private Boolean sandbox = false;

    /** 同步回调地址（与 returnUrl 等价） */
    public String getReturnUrl() {
        return returnUrl;
    }
}
