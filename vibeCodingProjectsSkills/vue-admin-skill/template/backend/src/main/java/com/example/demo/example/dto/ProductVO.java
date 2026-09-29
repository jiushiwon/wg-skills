package com.example.demo.example.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 商品视图对象（禁止实体直出）。
 */
@Data
@Schema(description = "商品视图对象")
public class ProductVO {

    private Long id;
    private String name;
    private String code;
    private String category;
    private BigDecimal price;
    private Integer stock;
    private String description;
    private Integer status;

    @Schema(description = "创建时间，yyyy-MM-dd HH:mm:ss")
    private String createdAt;
    @Schema(description = "更新时间，yyyy-MM-dd HH:mm:ss")
    private String updatedAt;
}
