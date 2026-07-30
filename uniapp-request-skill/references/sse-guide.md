# SSE 流式请求与打字机效果参考

> 跨端实现 Server-Sent Events，支持 AI 聊天、流式文案、打字机效果。

## 定位

请求层只负责建立 SSE 连接、解析 chunk、注入 Token、识别 401、暴露可取消接口。业务层（页面/composable）负责把收到的文本渲染成打字机效果。

## 跨端策略

| 平台 | 技术方案 | 说明 |
|------|----------|------|
| H5 | `EventSource` | 原生支持，但无法自定义 header，Token 放 query |
| 微信小程序 | `wx.request({ enableChunked: true })` | 监听 `onChunkReceived` 手动解析 |
| App | 优先使用 `plus.net` 或 H5 方案兜底 | 按实际运行时选择 |

## 文件位置

```
src/api/sse.ts
src/composables/useTypewriter.ts
```

## sse.ts 完整实现

```typescript
// src/api/sse.ts
import { getToken } from '@/utils/auth';
import { BASE_URL, DEFAULT_PREFIX } from '@/config/api.config';

export interface SseOptions {
  url: string;
  method?: 'GET' | 'POST';
  data?: Record<string, any>;
  header?: Record<string, string>;
  needAuth?: boolean;
  authMode?: 'bearer' | 'customer-token';
  timeout?: number;
}

export interface SseMessage<T = any> {
  event?: string;
  id?: string;
  data: T;
}

export interface SseTask {
  abort: () => void;
}

// 平台判断（延迟到调用时，避免模块加载阶段就访问运行时不稳定 API）
function isH5Platform(): boolean {
  return typeof window !== 'undefined' && !!window.EventSource;
}

export function sse<T = string>(
  options: SseOptions,
  onMessage: (msg: SseMessage<T>) => void,
  onError?: (err: any) => void,
  onOpen?: () => void
): SseTask {
  if (isH5Platform()) {
    return sseH5(options, onMessage, onError, onOpen);
  }
  return sseMiniProgram(options, onMessage, onError, onOpen);
}

// ===== H5：EventSource =====
function sseH5<T = string>(
  options: SseOptions,
  onMessage: (msg: SseMessage<T>) => void,
  onError?: (err: any) => void,
  onOpen?: () => void
): SseTask {
  const prefix = options.url.startsWith('http') ? '' : `${BASE_URL}${DEFAULT_PREFIX}`;
  let url = `${prefix}${options.url}`;

  // EventSource 不支持自定义 header，Token 通过 query 传递
  if (options.needAuth !== false) {
    const token = getToken();
    if (token) {
      const mode = options.authMode ?? 'customer-token';
      const key = mode === 'bearer' ? 'authorization' : 'customer-token';
      const sep = url.includes('?') ? '&' : '?';
      url += `${sep}${key}=${encodeURIComponent(token)}`;
    }
  }

  const source = new EventSource(url);
  let buffer = '';

  source.onopen = () => {
    onOpen?.();
  };

  source.onmessage = (event) => {
    try {
      const data = parseSseData<T>(event.data);
      onMessage({ id: event.lastEventId, data });
    } catch (err) {
      onError?.(err);
    }
  };

  source.onerror = (err) => {
    onError?.(err);
    source.close();
  };

  return {
    abort: () => {
      source.close();
    },
  };
}

// ===== 微信小程序：enableChunked =====
function sseMiniProgram<T = string>(
  options: SseOptions,
  onMessage: (msg: SseMessage<T>) => void,
  onError?: (err: any) => void,
  onOpen?: () => void
): SseTask {
  const headers: Record<string, string> = {
    Accept: 'text/event-stream',
    ...options.header,
  };

  if (options.needAuth !== false) {
    const token = getToken();
    if (token) {
      const mode = options.authMode ?? 'customer-token';
      if (mode === 'bearer') {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        headers['Customer-Token'] = token;
      }
    }
  }

  const prefix = options.url.startsWith('http') ? '' : `${BASE_URL}${DEFAULT_PREFIX}`;
  const url = `${prefix}${options.url}`;
  let buffer = '';

  const requestTask = uni.request({
    url,
    method: options.method || 'GET',
    data: options.data,
    header: headers,
    timeout: options.timeout || 60000,
    responseType: 'text',
    enableChunked: true,
    success: (res) => {
      if (res.statusCode === 401) {
        onError?.(new Error('登录已过期'));
        return;
      }
      // 连接正常结束时，buffer 中可能还有未解析数据
      if (buffer.trim()) {
        flushBuffer(buffer, onMessage, onError);
      }
    },
    fail: (err) => {
      onError?.(err);
    },
  });

  // 微信小程序需要显式调用 onHeadersReceived / onChunkReceived
  if ((requestTask as any).onHeadersReceived) {
    (requestTask as any).onHeadersReceived(() => {
      onOpen?.();
    });
  } else {
    // 其他平台可能没有该回调，直接触发 open
    onOpen?.();
  }

  if ((requestTask as any).onChunkReceived) {
    (requestTask as any).onChunkReceived((res: any) => {
      const chunk = arrayBufferToString(res.data);
      buffer += chunk;
      const { lines, rest } = splitSseLines(buffer);
      buffer = rest;
      lines.forEach((line) => {
        try {
          const msg = parseSseLine<T>(line);
          if (msg) onMessage(msg);
        } catch (err) {
          onError?.(err);
        }
      });
    });
  }

  return {
    abort: () => {
      requestTask.abort();
    },
  };
}

// ===== 解析辅助函数 =====
function arrayBufferToString(buffer: ArrayBuffer): string {
  const decoder = new TextDecoder('utf-8');
  return decoder.decode(buffer);
}

function splitSseLines(buffer: string): { lines: string[]; rest: string } {
  // 统一换行符为标准 \n，兼容 \r\n
  const normalized = buffer.replace(/\r\n/g, '\n');
  const lines: string[] = [];
  let rest = normalized;
  while (true) {
    const idx = rest.indexOf('\n\n');
    if (idx === -1) break;
    lines.push(rest.slice(0, idx));
    rest = rest.slice(idx + 2);
  }
  return { lines, rest };
}

function flushBuffer<T>(buffer: string, onMessage: (msg: SseMessage<T>) => void, onError?: (err: any) => void) {
  const { lines } = splitSseLines(buffer + '\n\n');
  lines.forEach((line) => {
    try {
      const msg = parseSseLine<T>(line);
      if (msg) onMessage(msg);
    } catch (err) {
      onError?.(err);
    }
  });
}

function parseSseLine<T>(line: string): SseMessage<T> | null {
  const fields: Record<string, string> = {};
  const dataLines: string[] = [];

  line.split('\n').forEach((row) => {
    const colonIndex = row.indexOf(':');
    if (colonIndex === -1) return;
    const key = row.slice(0, colonIndex).trim();
    const value = row.slice(colonIndex + 1).trim();

    if (key === 'data') {
      dataLines.push(value);
    } else {
      fields[key] = value;
    }
  });

  if (dataLines.length === 0) return null;

  return {
    event: fields.event,
    id: fields.id,
    data: parseSseData<T>(dataLines.join('\n')),
  };
}

function parseSseData<T>(raw: string): T {
  try {
    return JSON.parse(raw);
  } catch {
    return raw as unknown as T;
  }
}
```

## 打字机效果 Composable

```typescript
// src/composables/useTypewriter.ts
import { ref } from 'vue';

export function useTypewriter(options?: { speed?: number }) {
  const displayText = ref('');
  const isTyping = ref(false);
  const speed = options?.speed ?? 30;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let queue = '';

  function append(text: string) {
    queue += text;
    if (!isTyping.value) {
      isTyping.value = true;
      tick();
    }
  }

  function tick() {
    if (!queue) {
      isTyping.value = false;
      return;
    }
    // 每次输出 1-3 个字符，模拟真实打字节奏（仅 CSR 场景）
    const step = Math.min(queue.length, Math.floor(Math.random() * 3) + 1);
    displayText.value += queue.slice(0, step);
    queue = queue.slice(step);
    timer = setTimeout(tick, speed);
  }

  function reset() {
    if (timer) clearTimeout(timer);
    displayText.value = '';
    queue = '';
    isTyping.value = false;
  }

  function stop() {
    if (timer) clearTimeout(timer);
    queue = '';
    isTyping.value = false;
  }

  return {
    displayText,
    isTyping,
    append,
    reset,
    stop,
  };
}
```

## AI 聊天页面示例

```typescript
// src/pages/chat/chat.vue
import { ref, onUnmounted } from 'vue';
import { sse } from '@/api/sse';
import { useTypewriter } from '@/composables/useTypewriter';

const { displayText, isTyping, append, reset, stop } = useTypewriter({ speed: 40 });
let currentSse: ReturnType<typeof sse> | null = null;

function sendMessage(content: string) {
  reset();

  currentSse = sse<string>(
    {
      url: '/ai/chat/stream',
      method: 'POST',
      data: { content },
    },
    (msg) => {
      append(String(msg.data));
    },
    (err) => {
      uni.showToast({ title: '对话中断', icon: 'none' });
    },
    () => {
      console.log('SSE 连接已建立');
    }
  );
}

onUnmounted(() => {
  currentSse?.abort();
  stop();
});
```

## 注意事项

1. **H5 EventSource 无法自定义 header**：敏感 Token 建议通过 query 传递，并在后端校验；生产环境务必使用 HTTPS。
2. **微信小程序必须使用 `enableChunked: true`**：否则 `uni.request` 会等连接完全结束后才返回，失去流式意义。
3. **chunk 可能截断在任意字符位置**：必须使用 buffer 缓存未完整消息，按 `\n\n` 分割后再解析。
4. **页面卸载必须 abort**：SSE 连接默认不会随页面关闭而断开，需在 `onUnmounted` 中手动取消。
5. **401 处理**：SSE 连接建立失败或返回 401 时，应关闭连接并触发登录；不要尝试在 SSE 连接内刷新 Token。
6. **后端 SSE 格式**：每条消息以两个换行 `\n\n` 结束，`data:` 后可为 JSON 或纯文本。

## 使用建议

- AI 聊天、长文本生成：使用 `useTypewriter` 增加真实感。
- 实时通知、状态推送：不需要打字机，直接把 `msg.data` 更新到视图。
- 敏感接口：SSE 也走 Token 注入，失败时统一交给 `auth.service.ts` 处理。
