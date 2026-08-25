# 心跳保活与断线重连方案

## 为什么需要心跳

WebSocket 建立在 TCP 之上，但：

- 中间代理/Nginx 通常有 **60s 超时**，无数据传输会断开
- 运营商 NAT 映射表有 **300s 超时**，空闲连接会被丢弃
- 客户端网络切换（WiFi→4G）不会触发 close 事件

必须用心跳保活。

## 心跳时序

```
客户端（每 30s）          服务端
  │  {"type":"ping"}     │
  │ ────────────────────▶ │ 记录 last_ping_time
  │                       │
  │  {"type":"pong"}      │
  │ ◀──────────────────── │

服务端定时检查（每 10s）：
  if now - last_ping_time > 60s:
      断开连接
```

## 客户端实现

### H5 / Web

```javascript
class WSClient {
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.pingInterval = null;
    this.reconnectAttempts = 0;
  }

  connect() {
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log("已连接");
      this.reconnectAttempts = 0;
      this.startPing();
    };

    this.ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === "pong") return; // 心跳回复，忽略
      this.handleMessage(msg);
    };

    this.ws.onclose = () => {
      console.log("连接断开");
      this.stopPing();
      this.reconnect();
    };

    this.ws.onerror = () => {
      this.ws.close();
    };
  }

  startPing() {
    this.pingInterval = setInterval(() => {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: "ping" }));
      }
    }, 30000); // 30s
  }

  stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  reconnect() {
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 16000);
    this.reconnectAttempts++;
    console.log(`${delay / 1000}s 后重连...`);
    setTimeout(() => this.connect(), delay);
  }

  send(to, content, msgType = 1) {
    this.ws.send(JSON.stringify({
      type: "chat",
      to,
      content,
      msg_type: msgType
    }));
  }

  handleMessage(msg) {
    // 业务处理
    console.log("收到消息:", msg);
  }
}

// 使用
const client = new WSClient(`ws://localhost:8080/api/ws/${accessToken}`);
client.connect();
```

### uni-app

```javascript
// uni-app 原生 WebSocket
let wsTask = null;
let pingTimer = null;
let reconnectCount = 0;

function connectWS(token) {
  wsTask = uni.connectSocket({
    url: `ws://localhost:8080/api/ws/${token}`,
    success: () => console.log("连接中...")
  });

  wsTask.onOpen(() => {
    console.log("已连接");
    reconnectCount = 0;
    startPing();
  });

  wsTask.onMessage((res) => {
    const msg = JSON.parse(res.data);
    if (msg.type === "pong") return;
    handleMessage(msg);
  });

  wsTask.onClose(() => {
    stopPing();
    reconnect();
  });
}

function startPing() {
  pingTimer = setInterval(() => {
    wsTask.send({ data: JSON.stringify({ type: "ping" }) });
  }, 30000);
}

function stopPing() {
  if (pingTimer) clearInterval(pingTimer);
}

function reconnect() {
  const delay = Math.min(1000 * Math.pow(2, reconnectCount), 16000);
  reconnectCount++;
  setTimeout(() => connectWS(getToken()), delay);
}
```

## 服务端实现

```python
# app/ws/heartbeat.py

import asyncio
from datetime import datetime, timedelta

class HeartbeatMonitor:
    """心跳监控器：定期检查连接是否存活"""

    TIMEOUT = timedelta(seconds=60)  # 60s 未收到 ping 则断开
    CHECK_INTERVAL = 10              # 每 10s 检查一次

    def __init__(self):
        self._last_ping: dict[int, datetime] = {}
        self._task: asyncio.Task | None = None

    def record_ping(self, user_id: int):
        """记录用户最后一次 ping 时间"""
        self._last_ping[user_id] = datetime.utcnow()

    def remove(self, user_id: int):
        """用户断开时清理"""
        self._last_ping.pop(user_id, None)

    async def start(self, manager):
        """启动定时检查任务"""
        self._task = asyncio.create_task(self._check_loop(manager))

    async def _check_loop(self, manager):
        while True:
            await asyncio.sleep(self.CHECK_INTERVAL)
            now = datetime.utcnow()
            expired = [
                uid for uid, last in self._last_ping.items()
                if now - last > self.TIMEOUT
            ]
            for uid in expired:
                await manager.disconnect(uid, code=4002, reason="心跳超时")
                self.remove(uid)

heartbeat = HeartbeatMonitor()
```

## 多实例部署（Redis）

单机模式用内存 dict 管理连接即可。多实例时需要 Redis 做连接注册：

```
实例 A（user 1, 3 连接）
实例 B（user 2 连接）

user 1 发消息给 user 2：
  实例 A 查 Redis → user 2 在实例 B
  实例 A publish 到 Redis 频道 user:2
  实例 B 订阅该频道 → 转发给 user 2
```

| Redis 键 | 说明 |
|----------|------|
| `ws:online:{userId}` | 用户在线的实例 ID，TTL 90s（心跳续期） |
| `ws:channel:{userId}` | Redis Pub/Sub 频道 |

v1 先做单机，多实例作为后续迭代。
