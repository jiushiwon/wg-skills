package com.example.demo.auth.universallogin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 应用侧申请绑定码请求（应用发起 → 宿主确认）。
 *
 * <p>★ 不含 appId / appKey：应用身份由 {@code X-App-Key} 签名校验过滤器确定，
 * 请求体里传什么都会被忽略，杜绝「替别的应用申请绑定码」。</p>
 */
@Data
public class OpenBindApplyRequest {

    @NotBlank(message = "应用侧用户标识不能为空")
    @Size(max = 128, message = "应用侧用户标识不超过128字符")
    private String appUserId;

    @Size(max = 128, message = "应用侧用户名不超过128字符")
    private String appUserName;
}
