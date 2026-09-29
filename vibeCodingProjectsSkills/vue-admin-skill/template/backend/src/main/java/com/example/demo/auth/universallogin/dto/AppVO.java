package com.example.demo.auth.universallogin.dto;

import lombok.Data;

/**
 * 应用视图对象（出参）。
 *
 * <p>★ 不含任何密钥字段 —— 应用级密钥见 {@code AppKeyVO} / {@code CreatedAppKeyVO}。</p>
 */
@Data
public class AppVO {

    private Long id;
    private String appName;
    private String appKey;
    private String description;
    private String logo;
    private String callbackUrl;

    /** 1启用 0禁用。 */
    private Integer status;

    private String createdAt;
}
