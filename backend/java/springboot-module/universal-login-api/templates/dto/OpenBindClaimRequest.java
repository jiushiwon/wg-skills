package {{basePackage}}.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 应用侧认领绑定请求（扫码绑定：宿主发起 → 应用认领）。
 */
@Data
public class OpenBindClaimRequest {

    @NotBlank(message = "绑定码不能为空")
    private String code;

    @NotBlank(message = "应用侧用户标识不能为空")
    @Size(max = 128, message = "应用侧用户标识不超过128字符")
    private String appUserId;

    @Size(max = 128, message = "应用侧用户名不超过128字符")
    private String appUserName;
}
