// Agent 模块实体类

package com.{package}.agent.model;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("{prefix}_agent_session")
public class AgentSession {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    private String title;

    private String model;

    private Integer status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @TableLogic
    private LocalDateTime deletedAt;
}

@Data
@TableName("{prefix}_agent_message")
public class AgentMessage {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long sessionId;

    private String role;  // user / assistant / system / tool

    @TableField(columnDefinition = "text")
    private String content;

    private String toolName;

    @TableField(columnDefinition = "text")
    private String toolResult;

    private Integer tokens;

    private LocalDateTime createdAt;
}
