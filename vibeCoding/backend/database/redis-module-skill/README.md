# Redis Module Skill

面向已有后端项目的 Redis 缓存与分布式锁模块快速集成技能。

## 功能

快速集成 Redis 连接配置、缓存操作、分布式锁、限流、消息队列、计数器等能力。

## 使用方式

```
帮我加 Redis
集成 Redis 缓存
加个分布式锁
```

## 核心能力

| 能力 | 说明 |
|------|------|
| 连接配置 | Jedis/Lettuce/RedisTemplate/go-redis |
| 缓存操作 | String/Hash/List/Set/ZSet 操作 |
| 分布式锁 | Redisson/手动实现 |
| 限流 | 令牌桶/滑动窗口 |
| 消息队列 | List/Stream 延迟队列 |
| 计数器 | 点赞/访问量/排行榜 |

## 语言支持

| 语言 | 框架 | 说明 |
|------|------|------|
| Java | Spring Boot | RedisTemplate + Lettuce |
| Python | FastAPI | redis-py |
| Go | Gin | go-redis |

## 目录说明

```
redis-module-skill/
├── SKILL.md
├── README.md
└── references/
    ├── connection-pool.md    # 连接池配置详解
    ├── troubleshooting.md    # 常见问题排查
    └── performance-tuning.md # 性能调优指南
```

## 安装脚本

对应安装脚本：`docs/vibeCoding/super-deploy-skills/database-install-skill/children/redis-install-skill/`
