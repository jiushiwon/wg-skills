---
name: python-fast-skill
description: Python 快速入门学习技能。面向零基础小白，通过关键词触发快速回答 Python 核心知识点（数据类型、基础语法、函数、方法、集合、枚举、异常、IO、线程等），帮助小白建立知识框架和快速查询能力。触发词："Python 入门"、"Python 基础"、"Python 学什么"、"Python 数据类型"、"Python 语法"、"Python 集合"、"Python 异常"、"Python IO"、"Python 线程"、"Python 枚举"、"Python 教程"、"Python 快速学习"、"python learn"、"python tutorial"。
---

# Python Fast Learning Skill

面向**零基础小白**的 Python 快速入门学习助手。通过关键词触发，快速回答核心知识点，帮助建立知识框架。

## 知识体系覆盖

| 类别 | 包含内容 |
|------|----------|
| **数据类型** | 整数(int)、浮点(float)、字符串(str)、布尔(bool)、列表、元组、字典、集合、None |
| **基础语法** | 变量、运算符、条件判断(if/elif/else)、循环(for/while)、break/continue/pass |
| **函数** | 函数定义、参数(位置/关键字/默认/可变)、返回值、装饰器、lambda |
| **面向对象** | 类与对象、继承、多态、封装、特殊方法(__init__/__str__等) |
| **集合** | 列表list、元组tuple、字典dict、集合set、推导式 |
| **异常** | 异常体系、try/except/finally、raise、自定义异常、断言 |
| **IO** | 文件读写(open/with)、JSON/YAML/TOML、路径处理(pathlib) |
| **线程/进程** | threading、multiprocessing、concurrent.futures、异步asyncio |
| **类型提示** | 类型注解typing、Optional、Union、List/Dict[xxx] |
| **模块/包** | import、from...import、__init__.py、pip/conda |
| **推导式** | 列表推导式、字典推导式、集合推导式、生成器表达式 |

## 触发规则

### 自动触发场景

当用户提问包含以下关键词时，自动提供对应知识点的详细解答：

```
数据类型相关：数据类型、int、float、str、bool、list、tuple、dict、set、None
语法相关：语法、变量、常量、运算符、if、else、elif、for、while、循环、条件
函数相关：函数、def、lambda、装饰器、参数、返回值、可变参数
面向对象相关：类、class、对象、继承、多态、封装、self
集合相关：列表、元组、字典、集合、推导式、遍历
异常相关：异常、try、except、finally、raise、assert
IO相关：文件读写、open、with、JSON、pathlib
线程相关：线程、threading、multiprocessing、asyncio、协程
模块相关：import、from、pip、conda、模块、包
类型相关：类型注解、typing、Optional、Union
```

### 回答模板

每个知识点回答遵循 **"概念 → 语法 → 示例 → 常见坑"** 四段式：

```
📌 【知识点名称】
   是什么：一句话定义

💻 【语法】
   核心语法/写法

📝 【示例】
   完整可运行的代码示例

⚠️ 【常见坑】
   小白容易踩的坑和避坑建议
```

## 示例对话

### 示例 1：问数据类型
> 用户：Python 数据类型有哪些？

**自动回答**：
```
📌 【Python 数据类型】
   是什么：Python 内置的基本数据类型

💻 【基础类型】
   - int：整数，如 10, -5, 0
   - float：浮点数，如 3.14, -0.5
   - str：字符串，如 "hello", 'world'
   - bool：布尔，True / False
   - None：空值，表示"没有"

💻 【容器类型】
   - list：列表，可变有序 [1, 2, 3]
   - tuple：元组，不可变 (1, 2, 3)
   - dict：字典，键值对 {"name": "Tom", "age": 20}
   - set：集合，无序不重复 {1, 2, 3}

📝 【示例】
   # 基础类型
   age = 25              # int
   salary = 10000.5      # float
   name = "小明"          # str
   is_active = True      # bool
   result = None         # None

   # 容器类型
   fruits = ["苹果", "香蕉"]   # list
   coords = (10, 20)          # tuple
   person = {"name": "Tom"}    # dict
   numbers = {1, 2, 3}        # set

⚠️ 【常见坑】
   1. Python 不需要声明类型，变量即类型
   2. 字符串可以用单引号或双引号
   3. list/dict/set 是可变的，tuple 是不可变的
   4. 0、""、[]、None 在 if 中都视为 False
```

### 示例 2：问集合
> 用户：Python 集合怎么用？

**自动回答**：
```
📌 【Python 容器类型】
   是什么：Python 提供的四种核心容器：list、tuple、dict、set

💻 【四种容器对比】
   list（列表）：有序可重复，append/add/remove
   tuple（元组）：有序不可变，查询快
   dict（字典）：键值对，O(1) 查找
   set（集合）：无序不重复，去重神器

📝 【示例】
   # 列表 list
   fruits = ["苹果", "香蕉", "橙子"]
   fruits.append("葡萄")
   fruits[0]  # "苹果"

   # 元组 tuple
   coords = (10, 20)
   x, y = coords  # 解包

   # 字典 dict
   person = {"name": "Tom", "age": 20}
   person["age"] = 21
   person.get("gender", "未知")  # 安全获取

   # 集合 set
   nums = {1, 2, 3}
   nums.add(4)
   nums.add(1)  # 重复无效，自动去重

   # 列表推导式
   squares = [x**2 for x in range(10)]

⚠️ 【常见坑】
   1. 列表索引从 0 开始，不是 1
   2. 切片：list[1:3] 是左闭右开 [1,2)
   3. dict.get(key, default) 比 dict[key] 安全
   4. set 用于去重：list(set(items))
```

### 示例 3：问函数
> 用户：Python 函数怎么写？

**自动回答**：
```
📌 【Python 函数】
   是什么：可重复使用的代码块，用 def 定义

💻 【基本语法】
   def 函数名(参数):
       """文档字符串"""
       # 函数体
       return 返回值  # 可选

💻 【参数类型】
   - 位置参数：def f(a, b, c)
   - 关键字参数：f(a=1, b=2)
   - 默认参数：def f(a, b=10)
   - 可变参数：def f(*args, **kwargs)

📝 【示例】
   # 基本函数
   def greet(name):
       return f"你好，{name}！"

   # 默认参数
   def power(base, exp=2):
       return base ** exp

   # 可变参数
   def sum_all(*args):
       return sum(args)

   # Lambda（匿名函数）
   square = lambda x: x ** 2

   # 装饰器
   def timer(func):
       def wrapper(*args, **kwargs):
           import time
           start = time.time()
           result = func(*args, **kwargs)
           print(f"耗时: {time.time()-start:.2f}秒")
           return result
       return wrapper

   @timer
   def slow_func():
       import time
       time.sleep(1)

⚠️ 【常见坑】
   1. 默认参数不要用可变对象：def f(a=[]) ❌ → def f(a=None)
   2. *args 是元组，**kwargs 是字典
   3. Lambda 只能写简单表达式
   4. 装饰器顺序很重要：@a @b 和 @b @a 不同
```

### 示例 4：问异常
> 用户：Python 异常怎么用？

**自动回答**：
```
📌 【Python 异常处理】
   是什么：程序运行时出错的处理机制

💻 【异常体系】
   BaseException
   └── Exception
       ├── KeyboardInterrupt（Ctrl+C）
       ├── StopIteration
       ├── ArithmeticError
       │   └── ZeroDivisionError
       ├── LookupError
       │   ├── IndexError
       │   └── KeyError
       └── RuntimeError
           └── NameError
           └── TypeError

📝 【示例】
   try:
       result = 10 / 0
   except ZeroDivisionError as e:
       print(f"除零错误：{e}")
   except Exception as e:
       print(f"其他错误：{e}")
   else:
       print("没有异常时执行")
   finally:
       print("无论有无异常都执行")

   # 抛出异常
   def check_age(age):
       if age < 0:
           raise ValueError("年龄不能为负数")

   # 自定义异常
   class MyError(Exception):
       def __init__(self, message):
           self.message = message
           super().__init__(message)

   # 断言（调试用）
   assert age >= 0, "年龄不能为负数"

⚠️ 【常见坑】
   1. 异常要具体捕获，先子后父
   2. 不要 except: pass 空捕获
   3. finally 中的 return 会覆盖 try/except
   4. 抛出异常用 raise，不是 throw
```

## 知识卡片格式

对于常用知识点，提供**速查卡片**格式：

```
┌─────────────────────────────────────────────┐
│  💡 Python 基础速查                          │
├─────────────────────────────────────────────┤
│  基础类型：int, float, str, bool, None      │
│  容器类型：list, tuple, dict, set           │
│  循环：for x in list, while condition      │
│  函数：def f(*args, **kwargs):             │
│  推导式：[x for x in list]                 │
│  异常：try-except-raise-finally            │
│  模块：import, from...import, as           │
└─────────────────────────────────────────────┘
```

## 引用索引

| 文件 | 内容 |
|------|------|
| `references/python-basics.md` | 数据类型、变量、运算符、流程控制完整笔记 |
| `references/function-guide.md` | 函数定义、参数、装饰器、lambda |
| `references/oop-basics.md` | 面向对象：类、对象、继承、多态 |
| `references/collection-guide.md` | 列表、元组、字典、集合、推导式 |
| `references/exception-guide.md` | 异常处理最佳实践 |
| `references/io-guide.md` | 文件读写、JSON、pathlib |
| `references/thread-guide.md` | 多线程、进程、异步 asyncio |
| `references/module-guide.md` | 模块导入、包管理、pip |

## 不做

- 不提供完整的 Python 教程（太长）
- 不深入 Python 底层实现、元编程等进阶内容
- 不讲解具体项目开发（那是 fastapi-init-skill 的事）
- 不回答具体业务代码问题（只回答概念/语法/示例）
- 不提供 IDE / 环境安装使用教程
