package com.example.demo.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
@Schema(description = "菜单树节点")
public class MenuNode {
    private Long id;
    private Long parentId;
    private String name;
    private String path;
    private String component;
    @Schema(description = "M=目录 C=菜单 F=按钮（读取时兼容 B 视为 F）")
    private String menuType;
    private String icon;
    private String permission;
    private Integer sortOrder;
    private Integer visible;
    private Integer status;
    private List<MenuNode> children = new ArrayList<>();
}
