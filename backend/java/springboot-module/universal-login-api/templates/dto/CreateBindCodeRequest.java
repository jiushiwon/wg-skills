package {{basePackage}}.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 宿主侧生成绑定码请求（扫码绑定：宿主发起 → 应用认领）。
 */
@Data
public class CreateBindCodeRequest {

    @NotNull(message = "应用ID不能为空")
    private Long appId;
}
