# Python 容器与推导式

> 列表、元组、字典、集合、推导式。回答「Python 集合」「列表」「字典」「推导式」类问题时读本文。

---

## 一、四种容器对比

| 类型 | 有序 | 可变 | 可重复 | 查找 | 语法 |
|---|---|---|---|---|---|
| `list` | ✅ | ✅ | ✅ | O(n) | `[1, 2, 3]` |
| `tuple` | ✅ | ❌ | ✅ | O(n) | `(1, 2, 3)` |
| `dict` | ✅ | ✅ | key 唯一 | O(1) | `{"a": 1}` |
| `set` | ❌ | ✅ | ❌ | O(1) | `{1, 2, 3}` |

**选择原则**：能用 tuple 就别用 list（不可变更安全、可作 dict key）；需要按 key 查就用 dict；只需判重和集合运算就用 set。

---

## 二、列表 list

```python
fruits = ["苹果", "香蕉", "橙子"]

fruits.append("葡萄")       # 末尾追加
fruits.insert(0, "西瓜")    # 指定位置插入
fruits.remove("香蕉")       # 按值删除（删第一个）
fruits.pop()                # 弹出最后一个并返回
fruits.pop(0)               # 弹出第一个并返回
fruits[0] = "芒果"           # 按索引修改
fruits.sort()               # 原地排序
fruits.sort(key=lambda x: len(x), reverse=True)
fruits.reverse()
```

```python
# 常用操作
nums = [3, 1, 4, 1, 5]
len(nums)                 # 5
sum(nums)                 # 14
max(nums), min(nums)      # 5, 1
sorted(nums)              # 返回新列表，不改原列表
nums.count(1)             # 出现次数
1 in nums                 # 成员判断
```

### 切片

```python
nums = [0, 1, 2, 3, 4, 5]
nums[1:3]      # [1, 2]      左闭右开
nums[:3]       # [0, 1, 2]
nums[3:]       # [3, 4, 5]
nums[-2:]      # [4, 5]
nums[::2]      # [0, 2, 4]   步长
nums[::-1]     # 反转副本
```

⚠️ 切片**返回新列表**（不改动原列表），这一点和字符串一致。

---

## 三、元组 tuple

```python
coords = (10, 20)
x, y = coords               # 解包

a = (1,)                   # 单元素元组必须带逗号！
a = (1)                    # 这是 int，不是 tuple
```

常用场景：坐标、数据库记录、函数多返回值、字典 key。

```python
locations = {(10, 20): "起点", (30, 40): "终点"}
```

---

## 四、字典 dict

```python
user = {"name": "考拉", "age": 10}

user["email"] = "x@y.com"          # 新增/覆盖
user.get("gender", "未知")          # 安全取值，不抛异常
user.pop("age")                    # 删除并返回
user.setdefault("role", "user")    # 不存在则设默认值
len(user)                          # 键数量
"age" in user                      # 键是否存在
```

```python
# 遍历
for key in user: ...
for value in user.values(): ...
for key, value in user.items(): ...
```

```python
# 常用工具
sorted(user.items(), key=lambda kv: kv[1])     # 按值排序
{max(user, key=user.get)}                      # 最大值对应的键
list(user.keys()), list(user.values())
```

**字典合并（3.9+）**：

```python
merged = {**defaults, **overrides}
```

⚠️ 字典的键必须是**可哈希**的（str/int/tuple 可，list/dict 不可）。

---

## 五、集合 set

```python
tags = {"python", "ai"}
tags.add("web")
tags.remove("ai")        # 不存在会抛 KeyError
tags.discard("ai")       # 不存在也不报错（更安全）
"python" in tags
```

**集合运算**：

```python
a = {1, 2, 3}
b = {2, 3, 4}

a | b      # 并集 {1,2,3,4}
a & b      # 交集 {2,3}
a - b      # 差集 {1}
a ^ b      # 对称差集 {1,4}
```

**典型用途**：去重、判重、集合比较。

```python
unique = list(set(items))
if set(a) == set(b): ...       # 比较忽略顺序
```

---

## 六、推导式

Python 的招牌语法，比循环更短、更快。

```python
# 列表推导式
squares = [x ** 2 for x in range(10)]
evens = [x for x in range(100) if x % 2 == 0]
# 带条件 + 表达式
labels = ["偶" if x % 2 == 0 else "奇" for x in range(5)]

# 字典推导式
length_map = {w: len(w) for w in ["hello", "world"]}

# 集合推导式
unique_lengths = {len(w) for w in ["a", "bb", "cc"]}

# 生成器表达式（惰性求值，内存友好）
total = sum(x ** 2 for x in range(1000000))
```

**双 for 的顺序**：外层在前、内层在后。

```python
pairs = [(x, y) for x in range(3) for y in range(2)]
```

⚠️ **不要嵌套超过两层推导式** —— 可读性会崩，改成普通循环。

---

## 七、可变 vs 不可变：浅拷贝陷阱

```python
original = [1, 2, 3]
shallow = original[:]        # 新列表，但元素是同一个对象
alias = original              # 完全同一个对象
```

```python
import copy
deep = copy.deepcopy(original)     # 深拷贝，元素也复制
```

⚠️ 常见坑：把列表当默认参数、把可变对象直接赋给另一个变量（`b = a` 不是复制）、`dict.copy()` 是浅拷贝。

---

## 八、常见坑速查

| 坑 | 说明 | 正解 |
|---|---|---|
| 索引从 0 开始 | `nums[1]` 是第 2 个 | 切片左闭右开 |
| `dict[key]` 抛 KeyError | 键不存在 | 用 `dict.get(key, default)` |
| 单元素元组 | `(1)` 是 int | 写 `(1,)` |
| 遍历中修改列表 | 会漏元素或报错 | 遍历副本 / 用推导式 |
| 浅拷贝共享元素 | 修改副本元素会影响原对象 | `copy.deepcopy()` |
| set 不可哈希元素 | `list` 不能作 set 成员 | 转成 `tuple` |

---

## 相关文档

- [python-basics.md](python-basics.md) — 语法基础
- [function-guide.md](function-guide.md) — 函数与 lambda
