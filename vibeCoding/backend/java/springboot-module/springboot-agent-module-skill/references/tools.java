// Tool 注解与基类

package com.{package}.agent.tool;

import java.lang.annotation.*;

/**
 * Tool 注解
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Tool {
    String name() default "";
    String description() default "";
}

/**
 * Tool 参数注解
 */
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface ToolParam {
    String description() default "";
    boolean required() default false;
}

/**
 * Tool 基类
 */
public abstract class BaseTool<R> {

    public abstract R execute(Object... params);

    protected String getDescription() {
        return this.getClass().getAnnotation(Tool.class).description();
    }

    protected String getName() {
        return this.getClass().getAnnotation(Tool.class).name();
    }
}
