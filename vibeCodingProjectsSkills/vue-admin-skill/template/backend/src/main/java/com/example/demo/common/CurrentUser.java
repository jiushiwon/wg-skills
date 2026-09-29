// Derived from springboot-init-skill/demo/src/main/java/com/example/demo/common/CurrentUser.java
// See vue-admin-skill/template/backend/README.md#provenance
package com.example.demo.common;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 当前用户注解：标记在 Controller 方法参数上注入当前登录用户 ID。
 */
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
public @interface CurrentUser {
}