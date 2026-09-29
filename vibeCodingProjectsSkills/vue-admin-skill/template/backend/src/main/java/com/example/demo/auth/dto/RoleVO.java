package com.example.demo.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 角色视图对象。
 *
 * <p>★ `menuCount` 必须是**真值**（由 `SysRoleMenuRepository` 计数），
 * 不能让前端拿到 `undefined` 去显示"已授权菜单数"。</p>
 */
@Data
@Schema(description = "角色视图对象")
public class RoleVO {

    private Long id;
    private String name;
    private String code;
    private String description;

    @Schema(description = "数据权限：ALL / DEPT_AND_BELOW / DEPT_ONLY / SELF_ONLY")
    private String dataScope;

    private Integer sortOrder;
    private Integer status;

    @Schema(description = "已授权菜单数量")
    private Long menuCount;

    @Schema(description = "创建时间，yyyy-MM-dd HH:mm:ss")
    private String createdAt;
}
