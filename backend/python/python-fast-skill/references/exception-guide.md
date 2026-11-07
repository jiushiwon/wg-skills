# Python 异常处理

> 异常体系、try/except/finally、自定义异常、断言、最佳实践。回答「Python 异常」「try except」「raise」类问题时读本文。

---

## 一、异常体系

```
BaseException
├── KeyboardInterrupt      # Ctrl+C 手动中断
├── SystemExit             # sys.exit()
└── Exception              # 业务代码通常只捕获这一层
    ├── ArithmeticError
    │   └── ZeroDivisionError
    ├── LookupError
    │   ├── IndexError         # 列表越界
    │   └── KeyError           # 字典键不存在
    ├── TypeError              # 类型不匹配
    ├── ValueError             # 值不合法（参数校验最常用）
    ├── AttributeError         # 对象没有该属性
    ├── NameError              # 变量未定义
    ├── FileNotFoundError      # 文件不存在
    ├── TimeoutError
    └── RuntimeError           # 通用运行时错误
```

**层级要点**：捕获父类会捕获所有子类。所以 `except Exception` 能兜住 `ValueError`，反过来不行。

---

## 二、基本语法

```python
try:
    result = 10 / 0
except ZeroDivisionError as e:
    print(f"除零错误：{e}")
except Exception as e:           # 兜底，必须放最后
    print(f"其他错误：{e}")
else:
    print("没有异常时执行")       # try 块没抛异常才走
finally:
    print("无论如何都执行")       # 释放资源用这里
```

### 多个异常一起捕获

```python
try:
    ...
except (ValueError, TypeError) as e:      # 元组
    ...
```

---

## 三、抛出异常

```python
def check_age(age: int) -> None:
    if age < 0:
        raise ValueError("年龄不能为负数")
    if age > 150:
        raise ValueError(f"年龄超出合理范围: {age}")
```

```python
# 重新抛出并保留上下文
try:
    parse(raw)
except json.JSONDecodeError as e:
    raise ValueError(f"配置格式错误: {raw}") from e     # from e 保留原始堆栈
```

**`raise ... from e` 一定要写** —— 否则原始异常信息丢失，排查时只看到「配置格式错误」，看不到真正原因。

---

## 四、自定义异常

```python
class BizError(Exception):
    """业务异常基类。"""

    code = -1000

    def __init__(self, message: str, code: int | None = None):
        super().__init__(message)
        self.message = message
        if code is not None:
            self.code = code


class QuotaExceeded(BizError):
    """配额超限。"""

    def __init__(self, quota: int):
        super().__init__(f"配额已用尽: {quota}", code=-1001)
        self.quota = quota
```

工程建议：定义一个 `BizError` 基类 + 若干子类，前端拿到 `code` 就能做分支处理。

---

## 五、断言

```python
assert user is not None, "用户不应为空"
assert 0 <= score <= 100, f"分数越界: {score}"
```

⚠️ **断言会在 `python -O` 优化模式下被完全移除** —— **不要用 assert 做业务校验**，校验要用 `if ... raise`。

---

## 六、异常处理的最佳实践

### 6.1 三条铁律

1. **永远不要 `except: pass`** —— 吞掉错误只会让问题在更远的地方爆出来；
2. **先具体后宽泛** —— `except ValueError` 在前，`except Exception` 在后；
3. **只捕获你能处理的异常** —— 捕获后要么处理、要么重新抛出、要么带上上下文抛出。

### 6.2 什么时候该捕获，什么时候该抛

| 场景 | 做法 |
|---|---|
| 能恢复（降级、兜底、重试） | 捕获并处理 |
| 只是想换个说法 | `raise ... from e` |
| 完全处理不了 | 让它抛上去（顶层统一兜底） |
| 边界校验（用户输入、外部数据） | 捕获并转成友好错误 |

### 6.3 资源释放用 `with`

```python
with open("data.txt", "r", encoding="utf-8") as f:
    content = f.read()
# 离开 with 块自动关闭，即使抛异常
```

`with` 可以接任何实现了 `__enter__` / `__exit__` 的对象，是 Python 的资源管理惯例（文件、锁、数据库连接、临时目录）。

---

## 七、常见坑速查

| 坑 | 说明 | 正解 |
|---|---|---|
| 裸 `except:` | 吞掉包括 `KeyboardInterrupt` 在内的所有异常 | `except Exception:` |
| `except: pass` | 静默失败，问题无从查起 | 至少 `logger.exception()` |
| 顺序颠倒 | `except Exception` 在前导致具体异常永远走不到 | 具体在前，宽泛在后 |
| `finally` 里 `return` | 覆盖 try/except 的返回值或异常 | 不要在 finally 里 return |
| 用 assert 做校验 | `-O` 模式下被移除 | 用 `if ... raise` |
| 异常信息太笼统 | `raise ValueError("error")` 无信息 | 带上上下文和参数值 |
| 捕获后不处理 | 捕获了却不恢复也不重抛 | 三选一：处理 / 重抛 / 带上下文抛 |

---

## 相关文档

- [python-basics.md](python-basics.md) — 语法基础
- [io-guide.md](io-guide.md) — 文件与资源（`with` 的更多用法）
