package {basePackage}.agent.rate;

import {basePackage}.agent.audit.AgentAuditLogger;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Bucket4j 限流器
 * 本地内存限流（单实例）+ Redis 分布式限流（多实例）
 */
@Slf4j
public class Bucket4jRateLimiter {

    private final int permitsPerMinute;
    private final boolean enabled;

    /** 本地内存桶（单实例降级） */
    private final Map<String, Bucket> localBuckets = new ConcurrentHashMap<>();

    @Autowired(required = false)
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private AgentAuditLogger auditLogger;

    public Bucket4jRateLimiter(int permitsPerMinute, boolean enabled) {
        this.permitsPerMinute = permitsPerMinute;
        this.enabled = enabled;
    }

    /**
     * 尝试获取令牌
     * @param key 限流键（如 "chat:userId"）
     * @return true=通过，false=限流
     */
    public boolean tryAcquire(String key) {
        if (!enabled) return true;

        Bucket bucket = getBucket(key);
        boolean acquired = bucket.tryConsume(1);

        if (!acquired) {
            log.warn("限流命中: key={}", key);
        }

        return acquired;
    }

    /**
     * 获取剩余令牌数
     */
    public long getAvailableTokens(String key) {
        if (!enabled) return permitsPerMinute;
        return getBucket(key).getAvailableTokens();
    }

    /**
     * 获取/创建令牌桶
     */
    private Bucket getBucket(String key) {
        // 优先 Redis（多实例）
        if (redisTemplate != null) {
            return getRedisBucket(key);
        }
        // 降级本地内存
        return localBuckets.computeIfAbsent(key, k -> createBucket());
    }

    /**
     * Redis 分布式令牌桶
     */
    private Bucket getRedisBucket(String key) {
        String redisKey = "agent:ratelimit:" + key;
        Long count = redisTemplate.opsForValue().increment(redisKey);
        if (count != null && count == 1) {
            redisTemplate.expire(redisKey, Duration.ofMinutes(1));
        }
        if (count != null && count > permitsPerMinute) {
            return Bucket.builder().addLimit(Bandwidth.simple(0, Duration.ofMinutes(1))).build();
        }
        return createBucket();
    }

    /**
     * 创建令牌桶
     */
    private Bucket createBucket() {
        return Bucket.builder()
            .addLimit(Bandwidth.simple(permitsPerMinute, Duration.ofMinutes(1)))
            .build();
    }
}

package {basePackage}.agent.tool;

import {basePackage}.agent.audit.AgentAuditLogger;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.Map;

/**
 * 文件操作 Tools（编程助手场景）
 * 四重防护：路径白名单 + 大小限制 + 编码限制 + 审计日志
 */
@Slf4j
@Component
public class FileTools extends BaseTool {

    @Value("${agent.project-root:}")
    private String projectRoot;

    /** 默认读取大小限制 100KB */
    private static final long DEFAULT_READ_MAX_SIZE = 100 * 1024;
    /** 默认写入大小限制 1MB */
    private static final long DEFAULT_WRITE_MAX_SIZE = 1024 * 1024;

    /** 敏感目录黑名单 */
    private static final Path[] BLOCKED_PATHS = {
        Path.of("/etc"), Path.of("/root"), Path.of("/var/log"),
        Path.of("/proc"), Path.of("/sys"), Path.of("/dev")
    };

    /**
     * 安全读取文件（受限）
     */
    @AgentTool(name = "safeReadFile", description = "读取项目内受限文本文件（仅 UTF-8，大小限制 100KB）")
    public Map<String, Object> safeReadFile(
            @ToolParam(description = "文件路径（相对于项目根目录）") @NotBlank @Size(max = 500) String path,
            @ToolParam(description = "最大读取字节数") Long maxSize,
            @ToolParam(description = "当前用户ID（系统注入）") Long userId) {
        long limit = maxSize != null ? maxSize : DEFAULT_READ_MAX_SIZE;

        try {
            // 1. 路径安全校验
            Path resolved = resolveSafePath(path);

            // 2. 文件存在性检查
            if (!Files.exists(resolved)) {
                return Map.of("error", "文件不存在: " + path);
            }

            // 3. 大小检查
            long size = Files.size(resolved);
            if (size > limit) {
                return Map.of("error", "文件过大: " + size + " bytes，限制: " + limit + " bytes");
            }

            // 4. 读取（UTF-8）
            String content = Files.readString(resolved, StandardCharsets.UTF_8);

            // 5. 审计日志
            auditLogger.logFileOperation(userId, "read", path, size, true);

            return Map.of(
                "path", path,
                "size", size,
                "content", content
            );

        } catch (Exception e) {
            auditLogger.logFileOperation(userId, "read", path, 0, false);
            log.error("文件读取失败: {}", path, e);
            return Map.of("error", "文件读取失败: " + e.getMessage());
        }
    }

    /**
     * 安全写入文件（两步确认）
     * confirm=false → 返回 diff 预览，不写盘
     * confirm=true  → 二次调用才真正落盘
     */
    @AgentTool(name = "safeWriteFile", description = "写入项目内文件（两步确认：先预览 diff，再落盘）")
    public Map<String, Object> safeWriteFile(
            @ToolParam(description = "文件路径（相对于项目根目录）") @NotBlank @Size(max = 500) String path,
            @ToolParam(description = "新内容") @NotBlank String newContent,
            @ToolParam(description = "是否确认写入（false=仅预览 diff）") Boolean confirm,
            @ToolParam(description = "当前用户ID（系统注入）") Long userId) {

        try {
            // 1. 路径安全校验
            Path resolved = resolveSafePath(path);

            // 2. 大小检查
            if (newContent.getBytes(StandardCharsets.UTF_8).length > DEFAULT_WRITE_MAX_SIZE) {
                return Map.of("error", "内容过大，限制 1MB");
            }

            // 3. diff 预览模式
            if (confirm == null || !confirm) {
                String oldContent = Files.exists(resolved)
                    ? Files.readString(resolved, StandardCharsets.UTF_8)
                    : "";
                String diff = generateDiff(path, oldContent, newContent);
                return Map.of(
                    "preview", true,
                    "diff", diff,
                    "message", "预览模式，未写入。请确认后再次调用并设置 confirm=true"
                );
            }

            // 4. 确认写入
            Files.createDirectories(resolved.getParent());
            Files.writeString(resolved, newContent, StandardCharsets.UTF_8,
                StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);

            // 5. 审计日志
            auditLogger.logFileOperation(userId, "write", path,
                newContent.getBytes(StandardCharsets.UTF_8).length, true);

            return Map.of(
                "success", true,
                "path", path,
                "size", newContent.getBytes(StandardCharsets.UTF_8).length
            );

        } catch (Exception e) {
            auditLogger.logFileOperation(userId, "write", path, 0, false);
            log.error("文件写入失败: {}", path, e);
            return Map.of("error", "文件写入失败: " + e.getMessage());
        }
    }

    /**
     * 解析安全路径（路径白名单 + 敏感目录拦截）
     */
    private Path resolveSafePath(String path) throws IOException {
        if (projectRoot == null || projectRoot.isEmpty()) {
            throw new IOException("PROJECT_ROOT 未配置，文件操作不可用");
        }

        Path root = Path.of(projectRoot).toAbsolutePath().normalize();
        Path resolved = root.resolve(path).normalize();

        // 路径遍历攻击检查
        if (!resolved.startsWith(root)) {
            throw new IOException("路径越界: " + path);
        }

        // 敏感目录检查
        for (Path blocked : BLOCKED_PATHS) {
            if (resolved.startsWith(blocked)) {
                throw new IOException("禁止访问敏感目录: " + blocked);
            }
        }

        return resolved;
    }

    /**
     * 生成简单 diff 预览
     */
    private String generateDiff(String path, String oldContent, String newContent) {
        StringBuilder diff = new StringBuilder();
        diff.append("--- ").append(path).append(" (旧)\n");
        diff.append("+++ ").append(path).append(" (新)\n");

        String[] oldLines = oldContent.split("\n");
        String[] newLines = newContent.split("\n");

        int maxLines = Math.max(oldLines.length, newLines.length);
        for (int i = 0; i < maxLines && i < 100; i++) { // 最多显示 100 行
            if (i >= oldLines.length) {
                diff.append("+ ").append(newLines[i]).append("\n");
            } else if (i >= newLines.length) {
                diff.append("- ").append(oldLines[i]).append("\n");
            } else if (!oldLines[i].equals(newLines[i])) {
                diff.append("- ").append(oldLines[i]).append("\n");
                diff.append("+ ").append(newLines[i]).append("\n");
            }
        }

        return diff.toString();
    }
}
