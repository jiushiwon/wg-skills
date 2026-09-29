package com.example.demo.auth.universallogin.security;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * 应用级调用主体（`/api/open/**` 由签名校验过滤器写入 request attribute）。
 *
 * <p>与宿主 JWT 的 principal（Long userId）**刻意区分**：
 * 开放接口的调用方是「应用」，不是「某个宿主用户」。</p>
 */
@Data
@AllArgsConstructor
public class AppPrincipal {

    /** 应用 ID（由 AppKey 反查得到，请求体里传什么都不认）。 */
    private Long appId;

    /** 应用所有者（宿主用户 ID）。 */
    private Long ownerId;

    /** 本次调用使用的 apiKey（便于审计）。 */
    private String apiKey;
}
