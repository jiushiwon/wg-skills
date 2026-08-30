// Agent 模块配置属性

package com.{package}.agent.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "agent")
public class AgentProperties {

    /**
     * 默认模型
     */
    private String defaultModel = "gpt-4o-mini";

    /**
     * 温度
     */
    private Double temperature = 0.7;

    /**
     * 最大 Token 数
     */
    private Integer maxTokens = 2048;

    /**
     * 记忆轮数
     */
    private Integer memoryTurns = 20;

    /**
     * 最大迭代次数
     */
    private Integer maxIterations = 5;

    /**
     * 请求超时（秒）
     */
    private Integer timeout = 60;

    /**
     * 是否启用限流
     */
    private Boolean rateLimitEnabled = true;

    /**
     * 限流：每分钟请求数
     */
    private Integer rateLimitPerMinute = 10;
}
