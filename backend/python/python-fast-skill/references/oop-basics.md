# Python 面向对象

> 类、对象、继承、多态、封装、`__init__` / `__str__` 等特殊方法、`@property`、dataclass。回答「Python 类」「面向对象」「继承」「多态」类问题时读本文。

---

## 一、类的基本写法

```python
class Dog:
    """狗。"""

    # 类属性：所有实例共享
    kingdom = "动物"

    def __init__(self, name: str, age: int = 1):
        self.name = name          # 实例属性
        self.age = age

    def bark(self) -> str:
        return f"{self.name} 在叫"

    def __str__(self) -> str:
        return f"Dog(name={self.name}, age={self.age})"

    def __repr__(self) -> str:
        return f"Dog({self.name!r}, {self.age!r})"
```

```python
d = Dog("旺财", 3)
print(d.name)          # 旺财
print(d.bark())        # 旺财 在叫
print(d)               # 走 __str__
print(d.kingdom)       # 类属性，实例也能访问
```

⚠️ **`__init__` 不是构造函数**，它只是初始化方法；真正的对象创建由 `__new__` 完成（一般不用管）。

---

## 二、三种定义方式

### 2.1 实例方法（最常见）

第一个参数是 `self`，代表当前实例。

```python
class Counter:
    def __init__(self):
        self.count = 0

    def increment(self) -> None:
        self.count += 1
```

### 2.2 类方法 `@classmethod`

第一个参数是 `cls`，代表类本身。常用于**替代构造函数**。

```python
class User:
    def __init__(self, name: str, email: str):
        self.name = name
        self.email = email

    @classmethod
    def from_dict(cls, data: dict) -> "User":
        """从字典构造实例。"""
        return cls(name=data["name"], email=data["email"])

    @classmethod
    def anonymous(cls) -> "User":
        return cls(name="匿名", email="")
```

### 2.3 静态方法 `@staticmethod`

既不接收 `self` 也不接收 `cls`，就是个放在类里的普通函数。用于「逻辑上属于这个类，但不需要访问状态」的辅助函数。

```python
class Validator:
    @staticmethod
    def is_email(value: str) -> bool:
        return "@" in value and "." in value.split("@")[-1]
```

### 2.4 `@property`：把方法包装成属性

```python
class Rectangle:
    def __init__(self, width: float, height: float):
        self.width = width
        self.height = height

    @property
    def area(self) -> float:
        """面积。"""
        return self.width * self.height

    @area.setter
    def area(self, value: float) -> None:
        raise ValueError("面积是只读的")

r = Rectangle(3, 4)
print(r.area)          # 12，像属性一样访问
```

---

## 三、继承与多态

```python
class Animal:
    def __init__(self, name: str):
        self.name = name

    def speak(self) -> str:
        raise NotImplementedError("子类必须实现 speak()")

    def introduce(self) -> str:
        return f"我是{self.name}，{self.speak()}"


class Dog(Animal):
    def speak(self) -> str:
        return "汪汪"


class Cat(Animal):
    def speak(self) -> str:
        return "喵喵"
```

**多态**：调用方只依赖 `speak()` 这个接口，不需要知道具体是狗还是猫。

```python
for animal in [Dog("旺财"), Cat("咪咪")]:
    print(animal.introduce())
# 我是旺财，汪汪
# 我是咪咪，喵喵
```

### 3.1 `super()`

```python
class Dog(Animal):
    def __init__(self, name: str, breed: str):
        super().__init__(name)       # 调用父类 __init__
        self.breed = breed
```

**永远用 `super().__init__()`**，不要直接写 `Animal.__init__(self, name)` —— 前者支持多继承（MRO）。

### 3.2 多继承与 MRO

```python
class A: ...
class B(A): ...
class C(A): ...
class D(B, C): ...      # MRO: D -> B -> C -> A -> object
```

```python
print(D.__mro__)        # 查看方法解析顺序
```

### 3.3 抽象基类

```python
from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self) -> float:
        ...
```

---

## 四、dataclass：省掉一半样板代码

```python
from dataclasses import dataclass, field
from datetime import datetime

@dataclass
class User:
    name: str
    email: str
    age: int = 18
    tags: list[str] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.now)

    def greet(self) -> str:
        return f"你好，{self.name}"
```

`@dataclass` 自动生成 `__init__`、`__repr__`、`__eq__`。

⚠️ **可变默认值必须用 `field(default_factory=list)`** —— 直接写 `= []` 会踩和函数默认参数一样的坑。

常用参数：

```python
@dataclass(frozen=True)          # 不可变（类似 NamedTuple）
@dataclass(slots=True)           # 省内存（3.10+）
@dataclass(order=True)           # 支持比较排序
@dataclass(eq=False)             # 不比较相等性
```

---

## 五、常见特殊方法

| 方法 | 触发场景 |
|---|---|
| `__init__` | 实例创建后初始化 |
| `__str__` | `str(obj)` / `print(obj)`，面向用户 |
| `__repr__` | `repr(obj)`，面向调试（应能还原对象） |
| `__len__` | `len(obj)` |
| `__getitem__` | `obj[key]` |
| `__setitem__` | `obj[key] = v` |
| `__iter__` | `for x in obj` |
| `__contains__` | `x in obj` |
| `__eq__` | `a == b` |
| `__hash__` | `hash(obj)`（定义 `__eq__` 后需重定义） |
| `__enter__` / `__exit__` | `with obj:` |
| `__call__` | `obj()` —— 让实例像函数一样可调用 |

```python
class Counter:
    def __init__(self):
        self.count = 0

    def __call__(self) -> int:
        self.count += 1
        return self.count

c = Counter()
c()      # 1
c()      # 2
```

---

## 六、封装与命名约定

| 约定 | 含义 |
|---|---|
| `name` | 公开 |
| `_name` | 内部使用（约定，靠自觉） |
| `__name` | 名字改写（name mangling），防子类意外覆盖 |

**Python 没有真正的 private**，靠约定和 `__` 前缀。

---

## 七、常见坑速查

| 坑 | 说明 | 正解 |
|---|---|---|
| `@staticmethod` 里用 `self` | 没有 self | 去掉 self 参数 |
| 忘记 `super().__init__()` | 父类属性没初始化 | 显式调用 |
| dataclass 可变默认值 | 写成 `= []` | `field(default_factory=list)` |
| 继承时覆盖了 `__str__` 却不调 super | 输出丢失父类信息 | 用 `super().__str__()` |
| 在 `__init__` 里做重活 | 每个实例都慢 | 放 `__post_init__`（dataclass）或延迟初始化 |
| 滥用继承 | 层次混乱 | 优先组合（组合优于继承） |
| 浅拷贝导致共享属性 | `copy.copy` 共享嵌套对象 | `copy.deepcopy` |

---

## 相关文档

- [function-guide.md](function-guide.md) — 方法即函数，装饰器基础
- [collection-guide.md](collection-guide.md) — `__getitem__` / `__iter__` 依赖容器语义
