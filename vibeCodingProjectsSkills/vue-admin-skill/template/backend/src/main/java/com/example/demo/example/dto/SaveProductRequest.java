package com.example.demo.example.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 商品创建 / 更新请求。
 *
 * <p>入参走 DTO，避免把 {@code Product} 实体当 {@code @RequestBody}（红线 R5：
 * mass assignment 可注入 id / createdAt / updatedAt）。</p>
 */
@Data
@Schema(description = "商品保存请求")
public class SaveProductRequest {

    @NotBlank(message = "商品名称不能为空")
    private String name;

    @NotBlank(message = "商品编码不能为空")
    private String code;

    private String category;
    private BigDecimal price;
    private Integer stock;
    private String description;
    private Integer status;
}
