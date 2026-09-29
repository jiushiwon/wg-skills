package com.example.demo.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

@Data
@Schema(description = "分配菜单请求")
public class AssignMenusRequest {
    private List<Long> menuIds;
}
