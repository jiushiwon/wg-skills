package {{basePackage}}.dto;

import lombok.Data;

/**
 * 绑定码响应。
 *
 * <p>绑定码是**一次性**凭证，落库保存（{@code {prefix}_sys_bind_code}），
 * 默认 5 分钟有效，使用后立即失效。</p>
 */
@Data
public class BindCodeVO {

    private String code;

    /** app_initiated / user_initiated。 */
    private String direction;

    /** 剩余有效秒数。 */
    private Long expireSeconds;
}
