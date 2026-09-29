package {{basePackage}}.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 创建应用请求。
 *
 * <p>★ 不含 appKey / ownerId —— 两者均由服务端生成/注入，防止 mass assignment。</p>
 */
@Data
public class CreateAppRequest {

    @NotBlank(message = "应用名称不能为空")
    @Size(max = 100, message = "应用名称不超过100字符")
    private String appName;

    @Size(max = 500, message = "应用描述不超过500字符")
    private String description;

    @Size(max = 500, message = "Logo地址不超过500字符")
    private String logo;

    @Size(max = 500, message = "回调地址不超过500字符")
    private String callbackUrl;
}
