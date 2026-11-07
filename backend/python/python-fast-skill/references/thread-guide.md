# Python 并发：线程、进程、异步

> threading、multiprocessing、concurrent.futures、asyncio、GIL。回答「Python 线程」「Python 进程」「asyncio」「协程」「GIL」类问题时读本文。

---

## 一、先讲清 GIL

CPython 的 **GIL（全局解释器锁）** 让同一时刻只有一个线程执行 Python 字节码。

| 结论 | 说明 |
|---|---|
| 多线程**不能**加速 CPU 密集计算 | 多核用不上 |
| 多线程**可以**并发 IO 密集任务 | IO 等待时 GIL 会释放 |
| Python 3.13+ 提供 free-threaded 构建 | PEP 703，可选关闭 GIL（**非默认**，生产慎用） |

**GIL 影响的是「并行执行 Python 代码」，不是「同时等待 IO」。** 协程之所以高效，正是因为它在 IO 等待时主动让出控制权。

---

## 二、怎么选

| 任务类型 | 方案 | 典型场景 |
|---|---|---|
| IO 密集（HTTP、DB、文件） | `asyncio`（最佳）或 `ThreadPoolExecutor` | 并发调 100 个接口 |
| CPU 密集（计算、图像、推理） | `ProcessPoolExecutor` | 批量处理图片 |
| 已有同步库、IO 密集 | `ThreadPoolExecutor` | 老代码改造 |
| 计算密集 + 需要共享内存 | `multiprocessing`（共享内存/Manager） | 大数据处理 |

---

## 三、ThreadPoolExecutor（线程池）

```python
from concurrent.futures import ThreadPoolExecutor, as_completed

def fetch(url: str) -> dict:
    ...

urls = [f"https://example.com/{i}" for i in range(100)]

with ThreadPoolExecutor(max_workers=10) as executor:
    futures = {executor.submit(fetch, u): u for u in urls}
    for future in as_completed(futures):
        url = futures[future]
        try:
            print(url, future.result())
        except Exception as e:
            print(f"{url} 失败: {e}")
```

**注意**：`with` 退出时会等待所有任务完成；`executor.shutdown(wait=False)` 可不等。

---

## 四、ProcessPoolExecutor（进程池）

```python
from concurrent.futures import ProcessPoolExecutor

def heavy(x: int) -> int:
    return x ** 2

if __name__ == "__main__":          # Windows/macOS 必需
    with ProcessPoolExecutor() as executor:
        squares = list(executor.map(heavy, range(100)))
```

⚠️ **Windows / macOS 必须有 `if __name__ == "__main__":` 保护**，否则子进程会重复导入主模块导致无限创建进程。

**进程池的限制**：参数和返回值必须**可序列化（pickle）**。传大对象要考虑序列化开销。

---

## 五、asyncio

### 5.1 基本模型

```python
import asyncio

async def fetch(url: str) -> str:
    await asyncio.sleep(1)            # 模拟 IO
    return f"内容:{url}"

async def main() -> None:
    results = await asyncio.gather(
        fetch("https://a.com"),
        fetch("https://b.com"),
    )
    print(results)

asyncio.run(main())
```

**关键点**：函数体里有 `await` 才是协程；`await` 表示「这里要等，期间可以把 CPU 让给别的任务」。

### 5.2 常用 API

```python
# 并发执行，等待全部完成
results = await asyncio.gather(task1(), task2())

# 并发执行，谁先完成先返回
for result in await asyncio.as_completed([task1(), task2()]):
    print(result)

# 超时控制（3.11+ 用 asyncio.timeout）
try:
    result = await asyncio.wait_for(fetch("https://a.com"), timeout=5)
except asyncio.TimeoutError:
    print("超时")

# 任务组（3.11+，结构化并发，推荐）
async with asyncio.TaskGroup() as tg:
    tg.create_task(fetch("https://a.com"))
    tg.create_task(fetch("https://b.com"))
# 任一任务失败，整组自动取消
```

### 5.3 常见异步库

| 场景 | 库 | 用法 |
|---|---|---|
| HTTP | `httpx` | `async with httpx.AsyncClient() as client` |
| 数据库 | `asyncpg` / `aiomysql` / `motor` | 原生 async 驱动 |
| 文件 | `aiofiles` | `async with aiofiles.open(...)` |
| 消息队列 | `aiokafka` | — |

### 5.4 ⚠️ 别在 async 里调阻塞库

```python
# ❌ 错：requests.get 阻塞整个事件循环
async def fetch_all(urls):
    for u in urls:
        resp = requests.get(u)        # 阻塞！
```

```python
# ✅ 对：用异步客户端
async def fetch_all(urls):
    async with httpx.AsyncClient() as client:
        return await asyncio.gather(*[client.get(u) for u in urls])
```

**实在没有异步版本时**，丢进线程池：

```python
result = await asyncio.to_thread(blocking_func, arg)      # Python 3.9+
```

### 5.5 同步代码里跑异步

```python
asyncio.run(main())                    # 脚本入口

# 已在事件循环里（FastAPI 等）就不要用 asyncio.run，直接 await
```

---

## 六、线程 vs 协程 vs 进程

| 维度 | 线程 | 协程 | 进程 |
|---|---|---|---|
| 并发方式 | 抢占式切换 | 协作式（遇 await 让出） | 真并行 |
| 切换开销 | 中 | **极小** | 大 |
| 能否多核 | 否（GIL） | 否（GIL） | **能** |
| 内存开销 | 中 | **极小** | 大 |
| 调试难度 | 中 | 中（栈是拼接的） | 高 |
| 适合 | IO 密集、已有同步库 | **IO 密集、高并发** | CPU 密集 |

**结论**：IO 密集优先 `asyncio`（尤其是高并发场景）；CPU 密集用进程池；已有大量同步代码用线程池改造最省事。

---

## 七、常见坑速查

| 坑 | 说明 | 正解 |
|---|---|---|
| async 里调同步阻塞库 | 事件循环被卡死 | 用异步库或 `asyncio.to_thread` |
| 进程池缺 `__main__` 保护 | Windows/macOS 无限创建进程 | 加 `if __name__ == "__main__":` |
| 传不可序列化对象给进程池 | pickle 报错 | 只传可序列化对象 |
| 以为多线程能压满 CPU | GIL 限制 | CPU 密集用进程池 |
| `asyncio.run` 重复调用 | 事件循环已关闭 | 一次运行一个 `main()` |
| 协程忘了 `await` | 只创建了任务对象没执行 | 检查是否漏 await |
| 无限创建任务 | 内存爆 | 用 `Semaphore` 限流 |

```python
# 限流示例
sem = asyncio.Semaphore(10)

async def limited(url):
    async with sem:
        return await fetch(url)
```

---

## 相关文档

- [function-guide.md](function-guide.md) — 回调与装饰器基础
- [io-guide.md](io-guide.md) — 阻塞 IO 的来源
