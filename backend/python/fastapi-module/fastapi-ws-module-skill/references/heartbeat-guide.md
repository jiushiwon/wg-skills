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
  │ ────────────────────▶ │ 记录 last_active_time
  │                       │
  │  {"type":"pong"}      │
  │ ◀──────────────────── │

或：客户端发任意业务消息（chat/ack/read）也算心跳。

服务端定时检查（每 10s）：
  if now - last_active_time > 60s:
      断开该用户所有连接（多端登录场景）
```

> **关键变化**：任何客户端消息（chat / ack / read）都视作心跳，不强制每 30s 必须 ping。  
> 这避免了"用户在聊天时因为忘了 ping 而被踢"的反直觉体验。

## 客户端实现

### H5 / Web

```javascript
class WSClient {
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.pingTimer = null;
    this.reconnectAttempts = 0;
  }

  connect() {
    // 注意：token 走 query 参数，不在 URL 路径中
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
      try { this.ws.close(); } catch (e) {}
    };
  }

  startPing() {
    this.pingTimer = setInterval(() => {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: "ping" }));
      }
    }, 30000); // 30s
  }

  stopPing() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  reconnect() {
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 16000);
    this.reconnectAttempts++;
    console.log(`${delay / 1000}s 后重连...`);
    setTimeout(() => this.connect(), delay);
  }

  send(to, content, msgType = 1, clientMsgId) {
    // 客户端必须生成全局唯一的 clientMsgId（推荐 UUID）
    const id = clientMsgId || `cli-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    this.ws.send(JSON.stringify({
      type: "chat",
      to,
      msg_type: msgType,
      content,
      client_msg_id: id
    }));
    return id;
  }

  handleMessage(msg) {
    // 业务处理
    console.log("收到消息:", msg);
  }
}

// 使用
const token = localStorage.getItem("access_token");
const client = new WSClient(`ws://localhost:8080/api/ws?token=${token}`);
client.connect();
```

### uni-app

```javascript
// uni-app 原生 WebSocket
let wsTask = null;
let pingTimer = null;
let reconnectCount = 0;

function connectWS(token) {
  // 注意：token 走 query 参数
  wsTask = uni.connectSocket({
    url: `ws://localhost:8080/api/ws?token=${token}`,
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

    TIMEOUT = timedelta(seconds=60)  # 60s 无消息则断开该用户所有连接
    CHECK_INTERVAL = 10              # 每 10s 检查一次

    def __init__(self):
        self._last_active: dict[int, datetime] = {}
        self._task: asyncio.Task | None = None

    def record(self, user_id: int):
        """记录用户最后一次活动时间（ping 或任意业务消息）"""
        self._last_active[user_id] = datetime.utcnow()

    def remove(self, user_id: int):
        """用户断开时清理（多端登录时，最后一端断开才清理）"""
        self._last_active.pop(user_id, None)

    async def start(self, manager):
        """启动定时检查任务"""
        self._task = asyncio.create_task(self._check_loop(manager))

    async def _check_loop(self, manager):
        while True:
            await asyncio.sleep(self.CHECK_INTERVAL)
            now = datetime.utcnow()
            expired = [
                uid for uid, last in self._last_active.items()
                if now - last > self.TIMEOUT
            ]
            for uid in expired:
                # 多端登录场景：心跳超时断开该用户的所有连接
                await manager.force_disconnect_all(uid, code=4002, reason="心跳超时")
                self.remove(uid)


heartbeat = HeartbeatMonitor()
```

### 在 WS endpoint 中调用

```python
@router.websocket("/api/ws")
async def websocket_endpoint(websocket, token: str = Query(default="")):
    user_id = _verify_ws_token(token)
    if not user_id:
        await websocket.close(code=4001)
        return

    await manager.connect(user_id, websocket)
    heartbeat.record(user_id)  # 连接即记一次

    try:
        while True:
            raw = await websocket.receive_json()
            # 任何客户端消息都算心跳
            heartbeat.record(user_id)

            # ... 业务处理
    except WebSocketDisconnect:
        await manager.disconnect(user_id, websocket)
        # 多端登录：还有端在线就不清理心跳记录
        if not manager.is_online(user_id):
            heartbeat.remove(user_id)
```

## 多实例部署（Redis Pub/Sub）

单机模式用内存 dict 管理连接即可。多实例时需要 Redis 做连接注册：

```
实例 A（user 1, 3 连接；user 2, 1 连接）
实例 B（user 3, 1 连接）

user 1 发消息给 user 3：
  实例 A 查 Redis → user 3 在实例 B
  实例 A publish 到 Redis 频道 user:3
  实例 B 订阅该频道 → 转发给 user 3
```

| Redis 键 | 说明 |
|----------|------|
| `ws:online:{userId}` | 用户在线的实例 ID，TTL 90s（心跳续期） |
| `ws:channel:{userId}` | Redis Pub/Sub 频道 |

v1 先做单机，多实例作为后续迭代。具体实现参见 `references/multi-instance-guide.md`（待补）。

## 多端登录

`WSManager` 用 `defaultdict(set)` 管理连接：

```python
self._connections: dict[int, set[WebSocket]] = defaultdict(set)
```

- 同一用户可在 PC、手机、Web 多端登录
- 发送消息时 `send_to(user_id, data)` 广播到该用户的 Set 中所有连接
- 任何一端断开调用 `disconnect(user_id, ws)`（只移除该 ws，不影响其他端）
- 心跳超时调用 `force_disconnect_all(user_id)`（断开所有端）