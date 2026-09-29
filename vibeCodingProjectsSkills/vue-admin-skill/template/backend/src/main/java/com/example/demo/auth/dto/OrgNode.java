package com.example.demo.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
@Schema(description = "组织树节点")
public class OrgNode {
    private Long id;
    private Long parentId;
    private String name;
    private Integer sortOrder;
    private Long leaderUserId;
    private String phone;
    private String email;
    private Integer status;
    private List<OrgNode> children = new ArrayList<>();
}