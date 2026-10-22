# Python 基础速查

> 数据类型、变量、运算符、流程控制。回答「Python 基础」「数据类型」「变量」类问题时读本文。

---

## 一、数据类型

### 1.1 基本类型

| 类型 | 写法 | 说明 |
|---|---|---|
| `int` | `10`、`-5`、`0` | 整数（任意精度，不会溢出） |
| `float` | `3.14`、`-0.5` | 浮点数 |
| `str` | `"hello"`、`'world'` | 字符串，单双引号等价 |
| `bool` | `True`、`False` | 布尔，注意首字母大写 |
| `None` | `None` | 空值（不是 `null`/`NULL`） |

### 1.2 类型判断与转换

```python
type(x)                  # 查看类型
isinstance(x, str)       # 类型判断（推荐）

int("10")                # "10" -> 10
float("3.14")            # "3.14" -> 3.14
str(10)                  # 10 -> "10"
bool([])                 # [] -> False
```

### 1.3 真值判断（Python 的条件语义）

以下**全部为假**，其余一律为真：

```python
False, None, 0, 0.0, "", [], {}, set(), ()
```

```python
if not value:            # 空列表、空串、0 都是 False
    print("空值")
```

---

## 二、变量与命名

```python
user_name = "考拉"        # 推荐：蛇形命名
USER_MAX = 100            # 常量：全大写
_private = "内部"         # 下划线前缀：约定为内部使用
```

**规则**：字母 / 数字 / 下划线；不能以数字开头；不能用 `if`、`class` 等关键字；**大小写敏感**（`user` ≠ `User`）。

Python 支持**同时赋值**，这是交换变量的经典写法：

```python
a, b = 1, 2
a, b = b, a            # 交换
x, y, z = 1, 2, 3
```

---

## 三、运算符

| 类别 | 运算符 | 说明 |
|---|---|---|
| 算术 | `+ - * /` `//` `%` `**` | `/` 真除法，`//` 向下取整，`%` 取余，`**` 幂 |
| 比较 | `== != > < >= <=` | `==` 是比较，不是赋值 |
| 逻辑 | `and` `or` `not` | 短路求值 |
| 成员 | `in` `not in` | 判断是否在容器中 |
| 身份 | `is` `is not` | 判断**是不是同一个对象** |
| 赋值 | `=` `+=` `-=` `*=` `/=` | 复合赋值 |
| 三元 | `a if cond else b` | 条件表达式 |

```python
# 幂与整除
2 ** 10          # 1024
7 // 2           # 3
7 % 2            # 1
-7 // 2          # -4（向下取整，不是截断）
```

### 常见坑：`is` 不是 `==`

```python
a = [1, 2]
b = [1, 2]
a == b           # True：内容相等
a is b           # False：不是同一个对象
```

判断空值用 `is None`，**不要用 `== None`**。

---

## 四、流程控制

### 4.1 条件判断

```python
if score >= 90:
    grade = "A"
elif score >= 60:
    grade = "B"
else:
    grade = "C"
```

### 4.2 循环

```python
# for 遍历
for item in ["a", "b", "c"]:
    print(item)

for i in range(10):           # 0..9
    pass
for i in range(1, 11):        # 1..10
    pass
for i in range(0, 10, 2):     # 0,2,4,6,8
    pass

# 遍历字典
for key, value in user.items():
    print(key, value)

# while
count = 0
while count < 10:
    count += 1
```

### 4.3 循环控制

| 语句 | 作用 |
|---|---|
| `break` | 立即跳出整个循环 |
| `continue` | 跳过本次，进入下一次 |
| `pass` | 占位，不做任何事（写空函数体时用） |
| `else` | 循环**未被打断**时执行（`for...else` 是 Python 特色） |

```python
for n in nums:
    if n < 0:
        break
else:
    print("没有负数，循环正常结束")
```

### 4.4 条件表达式

```python
label = "成年" if age >= 18 else "未成年"
```

---

## 五、常见坑速查

| 坑 | 说明 | 正解 |
|---|---|---|
| 缩进不一致 | Python 用缩进表示代码块，混用 Tab/空格会报 `IndentationError` | 全项目统一 4 空格 |
| `=` 与 `==` | `=` 赋值，`==` 比较 | 写 `if x == 1` |
| 可变默认参数 | `def f(x, lst=[])` 列表被共享 | `def f(x, lst=None)` |
| 浅拷贝 | `list2 = list1` 共享同一对象 | `copy.deepcopy(list1)` |
| 修改遍历中的列表 | 边遍历边删会漏元素 | 遍历副本或用推导式 |
| `is` vs `==` | 判断对象身份 | 比较内容用 `==` |
| 除零 | `1/0` 抛 `ZeroDivisionError` | 先判分母 |

---

## 相关文档

- [function-guide.md](function-guide.md) — 函数、参数、装饰器
- [collection-guide.md](collection-guide.md) — 四种容器与推导式
- [exception-guide.md](exception-guide.md) — 异常处理
