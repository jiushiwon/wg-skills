package {{basePackage}}.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 更新应用请求。所有字段可选；appKey / ownerId 不可改。
 */
@Data
public class UpdateAppRequest {

    @Size(max = 100, message = "应用名称不超过100字符")
    private String appName;

    @Size(max = 500, message = "应用描述不超过500字符")
    private String description;

    @Size(max = 500, message = "Logo地址不超过500字符")
    private String logo;

    @Size(max = 500, message = "回调地址不超过500字符")
    private String callbackUrl;

    /** 1启用 0禁用。 */
    private Integer status;
}
