package {{basePackage}}.dto;

import lombok.Data;

/**
 * 创建密钥的响应（**唯一**会返回 apiSecret 的 DTO）。
 *
 * <p>★ 使用约束：</p>
 * <ol>
 *   <li>只由 {@code POST /api/apps/{id}/keys} 返回；</li>
 *   <li>列表 / 详情 / 更新接口一律使用 {@link AppKeyVO}（无 secret）；</li>
 *   <li>服务端**不得**把 secret 回写到持久化实体后再返回（历史缺陷：
 *       {@code key.setApiSecret(null)} 让前端永远拿不到 secret，同时脏检查会把库里的 secret 写成 null）。</li>
 * </ol>
 */
@Data
public class CreatedAppKeyVO {

    private Long id;
    private String keyName;
    private String apiKey;

    /** 仅此一次返回，请用户立即保存。 */
    private String apiSecret;

    private Integer status;
    private String createdAt;
}
