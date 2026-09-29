package {{basePackage}}.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 宿主侧确认绑定请求。
 *
 * <p>★ 只接受绑定码，<b>不接受也不需要主账户密码</b> ——
 * 调用方身份由宿主 JWT 决定（当前登录用户即被绑定用户）。
 * 历史缺陷：请求体里收 {@code mainUsername/mainPassword} 却从不校验，
 * 且前端根本不传，导致「知道用户名即可替他人绑定」+「功能必然 500」。</p>
 */
@Data
public class BindConfirmRequest {

    @NotBlank(message = "绑定码不能为空")
    private String code;
}
