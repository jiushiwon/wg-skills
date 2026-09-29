package {basePackage}.agent.tool;

import {basePackage}.agent.audit.AgentAuditLogger;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;

import java.lang.annotation.*;
import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.security.MessageDigest;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * Agent Tool 注解
 * 标注在方法上，声明该方法为 AI 可调用的工具
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface AgentTool {
    /** Tool 名称（LLM 调用时的函数名） */
    String name();
    /** Tool 描述（LLM 理解工具用途的依据） */
    String description();
    /** 执行超时（毫秒），默认 30000 */
    long timeout() default 30000L;
    /** 是否记录审计日志，默认 true */
    boolean audit() default true;
}

/**
 * Tool 参数注解
 * 标注在方法参数上，声明该参数为 Tool 的输入参数
 */
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface ToolParam {
    /** 参数描述 */
    String description();
    /** 是否必需，默认 true */
    boolean required() default true;
}

/**
 * Tool 基类
 * 提供异常脱敏、日志脱敏、审计日志等公共能力
 */
@Slf4j
public abstract class BaseTool {

    @Autowired
    protected AgentAuditLogger auditLogger;

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private static final Validator VALIDATOR = Validation.buildDefaultValidatorFactory().getValidator();

    /**
     * 执行 Tool（带异常脱敏 + 审计 + 参数校验）
     * 由 ToolExecutor 调用，子类不直接重写此方法
     */
    public final Object executeWithAudit(String toolName, Long userId, Map<String, Object> args, Method method, Object target) {
        long start = System.currentTimeMillis();
        String argsHash = hashArgs(args);

        try {
            // 1. 参数校验（Jakarta Bean Validation）
            validateParams(method, args);

            // 2. 参数注入（userId，@CurrentUser）
            args.put("userId", userId);

            // 3. 执行 Tool
            Object result = method.invoke(target, buildArgs(method, args));

            // 4. 审计日志（成功）
            if (isAuditEnabled(method)) {
                long duration = System.currentTimeMillis() - start;
                auditLogger.logToolCall(userId, null, toolName, argsHash, true, null, duration);
            }

            return result;

        } catch (Exception e) {
            // 5. 审计日志（失败）
            if (isAuditEnabled(method)) {
                long duration = System.currentTimeMillis() - start;
                auditLogger.logToolCall(userId, null, toolName, argsHash, false, e.getMessage(), duration);
            }

            // 6. 日志脱敏（只记参数名，不记值）
            log.error("Tool 执行失败: {}, 参数签名: {}", toolName, getArgSignature(method));

            // 7. 异常脱敏（客户端只收到固定话术）
            throw new RuntimeException("工具执行失败，请重试");
        }
    }

    /**
     * Jakarta Bean Validation 参数校验
     */
    private void validateParams(Method method, Map<String, Object> args) {
        Parameter[] params = method.getParameters();
        for (int i = 0; i < params.length; i++) {
            String paramName = params[i].getName();
            if ("userId".equals(paramName)) continue;

            Object value = args.get(paramName);
            Set<ConstraintViolation<Object>> violations = VALIDATOR.validateValue(
                method.getDeclaringClass(), method.getName(), value
            );
            if (!violations.isEmpty()) {
                String msg = violations.stream()
                    .map(ConstraintViolation::getMessage)
                    .collect(Collectors.joining(", "));
                throw new ConstraintViolationException("参数校验失败: " + msg, violations);
            }
        }
    }

    /**
     * 构建方法参数数组
     */
    private Object[] buildArgs(Method method, Map<String, Object> args) {
        Parameter[] params = method.getParameters();
        Object[] values = new Object[params.length];
        for (int i = 0; i < params.length; i++) {
            values[i] = args.get(params[i].getName());
        }
        return values;
    }

    /**
     * 参数签名（只记名称和类型，不记值）
     */
    private String getArgSignature(Method method) {
        return Arrays.stream(method.getParameters())
            .map(p -> p.getName() + ":" + p.getType().getSimpleName())
            .collect(Collectors.joining(", "));
    }

    /**
     * 参数哈希（SHA256）
     */
    private String hashArgs(Map<String, Object> args) {
        try {
            String json = OBJECT_MAPPER.writeValueAsString(args);
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(json.getBytes());
            return HexFormat.of().formatHex(hash).substring(0, 16);
        } catch (Exception e) {
            return "hash_error";
        }
    }

    /**
     * 检查是否启用审计
     */
    private boolean isAuditEnabled(Method method) {
        AgentTool annotation = method.getAnnotation(AgentTool.class);
        return annotation != null && annotation.audit();
    }
}

/**
 * Tool 注册表（线程安全，启动期一次性注册）
 */
public class ToolRegistry {

    private final Map<String, ToolRegistration> tools = new ConcurrentHashMap<>();

    public void register(String name, ToolRegistration registration) {
        tools.put(name, registration);
    }

    public ToolRegistration get(String name) {
        return tools.get(name);
    }

    public Map<String, ToolRegistration> getAll() {
        return Collections.unmodifiableMap(tools);
    }

    /**
     * Tool 注册信息
     */
    public record ToolRegistration(
        String name,
        String description,
        Method method,
        Object target,
        long timeout,
        boolean audit
    ) {}
}
