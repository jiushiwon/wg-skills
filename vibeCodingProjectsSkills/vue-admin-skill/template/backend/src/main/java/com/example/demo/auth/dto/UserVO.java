package com.example.demo.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

/**
 * 用户视图对象。
 *
 * <p>★ **不含 `password`**：实体直出会让 BCrypt 哈希泄漏到响应里（红线 R5）。</p>
 *
 * <p>列表项**不含** `roles` / `posts`；详情接口才会填充这两个字段，回填则走
 * `GET /api/users/{id}/roles` 与 `GET /api/users/{id}/posts`。</p>
 */
@Data
@Schema(description = "用户视图对象（无 password）")
public class UserVO {

    private Long id;
    private String username;
    private String nickname;
    private String email;
    private String phone;
    private String avatar;
    private Long tenantId;
    private Long orgId;
    @Schema(description = "所属部门名称（由 orgId 反查）")
    private String orgName;
    private Integer status;
    @Schema(description = "创建时间，yyyy-MM-dd HH:mm:ss")
    private String createdAt;
    @Schema(description = "更新时间，yyyy-MM-dd HH:mm:ss")
    private String updatedAt;

    /** 仅详情接口返回；列表接口为 null。 */
    @Schema(description = "已分配角色（仅详情）")
    private List<SimpleRefVO> roles;

    /** 仅详情接口返回；列表接口为 null。 */
    @Schema(description = "已分配岗位（仅详情）")
    private List<SimpleRefVO> posts;
}
