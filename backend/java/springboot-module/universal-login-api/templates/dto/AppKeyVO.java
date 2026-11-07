package {{basePackage}}.dto;

import lombok.Data;

/**
 * 应用密钥视图对象（出参）。
 *
 * <p>★ <b>永远不含 apiSecret</b>。创建密钥时用 {@link CreatedAppKeyVO}（唯一一次返回 secret）。</p>
 */
@Data
public class AppKeyVO {

    private Long id;
    private String keyName;
    private String apiKey;
    private Integer status;
    private String lastUsedAt;
    private String createdAt;
}
