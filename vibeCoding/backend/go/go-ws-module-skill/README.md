# Go Gin WebSocket Module Skill

面向已有 Go Gin 项目的 WebSocket 即时通信模块快速集成技能。

## 功能

快速集成 WebSocket 长连接、单聊消息、好友校验、离线推送等能力。

## 使用方式

```
帮我加 WebSocket
集成 IM 聊天模块
```

## 核心能力

| 能力 | 说明 |
|------|------|
| WebSocket 长连接 | JWT 鉴权、多端登录 |
| 单聊消息 | 文本/图片/语音 |
| 好友校验 | 仅好友可互发消息 |
| 消息幂等 | client_msg_id 去重 |
| 离线推送 | 上线推送离线消息 |
| 未读数 | 未读计数 |
| 会话列表 | 最近会话排序 |
| 聊天记录 | cursor 翻页 |

## 目录说明

```
go-ws-module-skill/
├── SKILL.md                    # 技能定义
├── README.md                   # 本文件
└── references/                 # 参考资料
    ├── skeleton.go            # 模块代码模板
    ├── ws-protocol.md        # 消息协议
    └── heartbeat-guide.md    # 心跳方案
```
