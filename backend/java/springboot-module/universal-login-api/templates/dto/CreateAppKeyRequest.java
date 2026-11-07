package {{basePackage}}.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 创建应用密钥请求。
 */
@Data
public class CreateAppKeyRequest {

    @Size(max = 64, message = "密钥名称不超过64字符")
    private String keyName;
}
