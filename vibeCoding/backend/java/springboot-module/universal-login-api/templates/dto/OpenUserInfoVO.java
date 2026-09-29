package {{basePackage}}.dto;

import lombok.Data;

/**
 * 开放接口：宿主用户信息（应用侧换取）。
 *
 * <p>★ 出参按绑定关系剪裁：未绑定时只返回 {@code bound=false}，不泄露任何宿主用户字段。</p>
 */
@Data
public class OpenUserInfoVO {

    /** 该 appUserId 是否已绑定到宿主账户。 */
    private Boolean bound;

    /** 绑定关系 ID（未绑定时为 null）。 */
    private Long bindingId;

    /** 宿主用户 ID（未绑定时为 null）。 */
    private Long userId;

    private String username;
    private String nickname;
    private String avatar;
    private String email;
    private String phone;

    /** 应用侧用户标识（回显，便于应用侧对齐）。 */
    private String appUserId;
}
