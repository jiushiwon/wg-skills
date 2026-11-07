# Python 函数指南

> 函数定义、参数形式、作用域、装饰器、lambda。回答「Python 函数」「装饰器」「lambda」类问题时读本文。

---

## 一、基本定义

```python
def greet(name: str) -> str:
    """向某人问好。"""
    return f"你好，{name}"
```

```python
# 无返回值
def log(msg: str) -> None:
    print(msg)

# 多返回值（实际返回一个元组）
def minmax(nums: list[int]) -> tuple[int, int]:
    return min(nums), max(nums)

lo, hi = minmax([3, 1, 4])       # 解包
```

**docstring 是函数契约**。工程上建议每个公开函数都写，AI 时代尤其重要（模型靠它判断怎么调用）：

```python
def calculate_total(price: float, count: int) -> float:
    """计算商品总价。

    Args:
        price: 商品单价（元）
        count: 购买数量，必须为正

    Returns:
        总价（元）

    Raises:
        ValueError: count 非正数时抛出
    """
    if count <= 0:
        raise ValueError("购买数量必须为正")
    return round(price * count, 2)
```

---

## 二、参数形式

```python
def func(a, b=10, *args, **kwargs):
    ...
```

| 形式 | 含义 | 调用方式 |
|---|---|---|
| `a` | 位置参数 | `func(1)` |
| `b=10` | 默认参数 | `func(1, b=2)` |
| `*args` | 不定位置参数（收集成 tuple） | `func(1, 2, 3)` |
| `**kwargs` | 不定关键字参数（收集成 dict） | `func(x=1)` |
| `*` 之后的参数 | 关键字专用 | 只能用名字传 |

```python
def connect(host, *, timeout=3, retries=2):
    ...
connect("localhost")                 # ✅
connect("localhost", 5)               # ❌ TypeError
```

### ⚠️ 默认值不能用可变对象

```python
# ❌ 这个列表被所有调用共享
def add(item, basket=[]):
    basket.append(item)
    return basket

# ✅ 用 None 做哨兵
def add(item, basket=None):
    if basket is None:
        basket = []
    basket.append(item)
    return basket
```

---

## 三、作用域

| 层级 | 说明 |
|---|---|
| **局部作用域** | 函数内部，函数外不可见 |
| **全局作用域** | 模块顶层，用 `global` 修改 |
| **闭包** | 内嵌函数访问外层函数变量 |
| **内置作用域** | `len`、`sum` 等内置函数 |

**LEGB 规则**：Local → Enclosing → Global → Builtin，就近查找。

```python
def outer():
    x = "外层"
    def inner():
        return x          # 闭包：捕获外层变量
    return inner()
```

**只读全局变量不需要 `global`；要赋值才需要**（且不推荐到处用 `global`）。

---

## 四、Lambda

```python
square = lambda x: x ** 2
add = lambda a, b: a + b
```

⚠️ **只能写单个表达式**，不能写语句（不能 `if` 分支块、不能 `for`）。复杂逻辑用 `def`。

排序时常用：

```python
users.sort(key=lambda u: u["age"])
```

---

## 五、装饰器

装饰器是「接收函数、返回新函数」的高阶函数。

```python
import functools
import time

def timer(func):
    @functools.wraps(func)          # 保留原函数元信息（重要）
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        print(f"{func.__name__} 耗时 {time.perf_counter() - start:.3f}s")
        return result
    return wrapper

@timer
def slow_func():
    time.sleep(1)
```

### 带参数的装饰器

```python
import functools

def retry(times: int = 3):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            for i in range(times):
                try:
                    return func(*args, **kwargs)
                except Exception:
                    if i == times - 1:
                        raise
        return wrapper
    return decorator

@retry(times=3)
def fetch(url): ...
```

### 常用内置装饰器

| 装饰器 | 作用 |
|---|---|
| `@functools.cache` | 缓存函数结果（3.9+） |
| `@functools.lru_cache(maxsize=128)` | LRU 缓存，可指定容量 |
| `@functools.wraps(func)` | 装饰器内部使用，保留原函数信息 |
| `@property` | 把方法包装成属性（见 oop-basics.md） |
| `@staticmethod` / `@classmethod` | 静态方法 / 类方法 |

```python
import functools

@functools.cache
def fib(n: int) -> int:
    return n if n < 2 else fib(n - 1) + fib(n - 2)
```

---

## 六、常见坑

| 坑 | 说明 |
|---|---|
| 默认值可变对象 | 列表/字典默认值被共享 |
| 忘记 `return` | 函数返回 `None` |
| 装饰器没加 `@functools.wraps` | 函数名、docstring、签名全丢，调试和 AI 阅读都受影响 |
| 闭包延迟绑定 | 循环里创建闭包捕获的是变量本身而非当时的值，用默认参数 `lambda i=i: ...` 固定 |
| `*args` 误解 | 收到的是 tuple，不是 list |
| lambda 写复杂逻辑 | 无法多语句，改用 `def` |

---

## 相关文档

- [python-basics.md](python-basics.md) — 语法基础
- [oop-basics.md](oop-basics.md) — 类与方法
