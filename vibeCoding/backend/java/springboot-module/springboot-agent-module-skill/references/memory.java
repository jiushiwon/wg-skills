package com.{package}.agent.memory;

import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.messages.Message;
import org.springframework.data.redis.core.RedisTemplate;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

/**
 * Agent 记忆管理器
 * Deque 自动裁剪 + LRU 内存缓冲 + Redis 可选
 */
@Slf4j
public class MemoryManager {

    /** 每个会话保留的最大消息轮数 */
    private final int maxTurns;

    /** 内存缓存（LRU，按 sessionId 访问排序） */
    private final Map<Long, Deque<Message>> memoryCache = new LinkedHashMap<>(16, 0.75f, true) {
        @Override
        protected boolean removeEldestEntry(Map.Entry<Long, Deque<Message>> eldest) {
            return size() > 100; // 最多缓存 100 个会话
        }
    };

    /** Redis 可选（多实例部署） */
    private RedisTemplate<String, Object> redisTemplate;

    public MemoryManager(int maxTurns) {
        this.maxTurns = maxTurns;
    }

    /**
     * 注入 RedisTemplate（可选）
     */
    public void setRedisTemplate(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    /**
     * 获取会话历史消息
     * 优先从内存缓存读取，缓存未命中时从数据库加载
     */
    public Deque<Message> getHistory(Long sessionId, List<Message> dbMessages) {
        // 1. 内存缓存
        Deque<Message> cached = memoryCache.get(sessionId);
        if (cached != null) {
            return cached;
        }

        // 2. Redis 缓存（多实例部署）
        if (redisTemplate != null) {
            String key = "agent:memory:" + sessionId;
            @SuppressWarnings("unchecked")
            List<Message> redisMessages = (List<Message>) redisTemplate.opsForValue().get(key);
            if (redisMessages != null) {
                Deque<Message> deque = new ArrayDeque<>(redisMessages);
                memoryCache.put(sessionId, deque);
                return deque;
            }
        }

        // 3. 数据库加载（自动裁剪到 maxTurns * 2）
        Deque<Message> history = new ArrayDeque<>(maxTurns * 2);
        int start = Math.max(0, dbMessages.size() - maxTurns * 2);
        for (int i = start; i < dbMessages.size(); i++) {
            history.addLast(dbMessages.get(i));
        }

        memoryCache.put(sessionId, history);
        return history;
    }

    /**
     * 添加消息到内存缓存
     */
    public void addMessage(Long sessionId, Message message) {
        Deque<Message> history = memoryCache.computeIfAbsent(sessionId, k -> new ArrayDeque<>(maxTurns * 2));
        history.addLast(message);

        // 自动裁剪：超过 maxTurns * 2 时移除最旧的消息
        while (history.size() > maxTurns * 2) {
            history.removeFirst();
        }

        // 同步到 Redis
        if (redisTemplate != null) {
            String key = "agent:memory:" + sessionId;
            redisTemplate.opsForValue().set(key, new ArrayList<>(history), 24, TimeUnit.HOURS);
        }
    }

    /**
     * 清除会话内存缓存
     */
    public void clearSession(Long sessionId) {
        memoryCache.remove(sessionId);
        if (redisTemplate != null) {
            redisTemplate.delete("agent:memory:" + sessionId);
        }
        log.info("清除会话内存缓存: sessionId={}", sessionId);
    }

    /**
     * 清除所有内存缓存
     */
    public void clearAll() {
        memoryCache.clear();
        log.info("清除所有内存缓存");
    }
}
