package com.example.demo.auth.universallogin.dto;

import lombok.Data;

/**
 * 绑定视图对象（出参）。只描述「当前登录用户自己的」绑定。
 */
@Data
public class BindVO {

    private Long id;
    private Long appId;
    private String appKey;
    private String appName;
    private String logo;

    /** 应用侧用户标识（第三方系统里的账号）。 */
    private String appUserId;
    private String appUserName;

    /** app_initiated / user_initiated。 */
    private String bindType;

    private Boolean isDefault;
    private String bindAt;
}
