---
name: java-fast-skill
description: Java 快速入门学习技能。面向零基础小白，通过关键词触发快速回答 Java 核心知识点（数据类型、基础语法、函数、方法、集合、枚举、异常、IO、线程等），帮助小白建立知识框架和快速查询能力。触发词："Java 入门"、"Java 基础"、"Java 学什么"、"Java 数据类型"、"Java 语法"、"Java 集合"、"Java 异常"、"Java IO"、"Java 线程"、"Java 枚举"、"Java 教程"、"Java 快速学习"、"java learn"、"java tutorial"。
---

# Java Fast Learning Skill

面向**零基础小白**的 Java 快速入门学习助手。通过关键词触发，快速回答核心知识点，帮助建立知识框架。

## 知识体系覆盖

| 类别 | 包含内容 |
|------|----------|
| **数据类型** | 基本类型（int/long/double/boolean/char）、引用类型、类型转换、自动装箱拆箱 |
| **基础语法** | 变量声明、运算符、条件判断（if/else/switch）、循环（for/while/do-while）、break/continue |
| **函数/方法** | 方法定义、参数传递（值传递）、返回值、方法重载、可变参数 |
| **面向对象** | 类与对象、封装、继承、多态、抽象类、接口、构造器、this/super |
| **集合框架** | List（ArrayList/LinkedList）、Set（HashSet/TreeSet）、Map（HashMap/TreeMap）、迭代器 |
| **枚举** | 枚举定义、枚举方法、枚举switch、枚举与单例 |
| **异常** | 异常体系（RuntimeException/Checked Exception）、try-catch-finally、throw/throws、自定义异常 |
| **IO** | File/Reader/Writer、InputStream/OutputStream、缓冲流、字符流vs字节流、try-with-resources |
| **线程** | Thread/Runnable、线程状态、线程同步（synchronized/lock）、线程池、volatile |
| **泛型** | 泛型类/泛型方法、泛型通配符、类型擦除 |
| **Lambda** | 函数式接口、Lambda表达式、方法引用、Stream API |

## 触发规则

### 自动触发场景

当用户提问包含以下关键词时，自动提供对应知识点的详细解答：

```
数据类型相关：数据类型、int、long、double、float、boolean、char、byte、short、String
语法相关：语法、变量、常量、运算符、if、else、switch、for、while、循环、条件
方法相关：方法、函数、参数、返回值、重载、可变参数
面向对象相关：类、对象、继承、封装、多态、抽象、接口、构造器
集合相关：集合、List、ArrayList、Set、HashSet、Map、HashMap、遍历
异常相关：异常、try、catch、throw、throws、RuntimeException
IO相关：IO、文件读取、文件写入、InputStream、OutputStream、Reader、Writer
线程相关：线程、Thread、Runnable、synchronized、lock、volatile、线程池
枚举相关：枚举、enum
泛型相关：泛型、Generic、<?>、<T>
Lambda相关：Lambda、stream、filter、map、reduce
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
> 用户：Java 数据类型有哪些？

**自动回答**：
```
📌 【Java 数据类型】
   是什么：Java 分为基本类型和引用类型两大类

💻 【语法】
   基本类型（8种）：
   - 整数：byte(8位), short(16位), int(32位), long(64位)
   - 浮点：float(32位), double(64位)
   - 字符：char(16位Unicode)
   - 布尔：boolean(true/false)

   引用类型：类、接口、数组、枚举、注解

📝 【示例】
   int age = 25;           // 整数
   double salary = 10000.5; // 浮点
   char grade = 'A';       // 字符
   boolean isActive = true; // 布尔
   String name = "小明";    // 字符串（引用类型）

⚠️ 【常见坑】
   1. long 类型数字后要加 L：long a = 100L;（否则是 int）
   2. float 类型要加 F：float b = 3.14f;
   3. String 不是基本类型，是引用类型
```

### 示例 2：问集合
> 用户：Java 集合有哪些？

**自动回答**：
```
📌 【Java 集合框架】
   是什么：Java 提供的用于存储多个对象的容器

💻 【核心接口】
   Collection
   ├── List（有序可重复）
   │   ├── ArrayList（数组实现，查询快增删慢）
   │   └── LinkedList（链表实现，增删快查询慢）
   └── Set（无序不可重复）
       ├── HashSet（哈希表，无序）
       └── TreeSet（红黑树，有序）
   Map（键值对）
   ├── HashMap（哈希表）
   └── TreeMap（红黑树）

📝 【示例】
   // 列表
   List<String> list = new ArrayList<>();
   list.add("苹果");
   list.add("香蕉");

   // 集合
   Set<Integer> set = new HashSet<>();

   // 映射
   Map<String, Integer> map = new HashMap<>();
   map.put("苹果", 10);

⚠️ 【常见坑】
   1. List/Set/Map 是接口，不能直接实例化
   2. HashMap 非线程安全，高并发用 ConcurrentHashMap
   3. 遍历用 for-each 或 iterator，不要用 for(int i=0...)
```

### 示例 3：问异常
> 用户：Java 异常怎么用？

**自动回答**：
```
📌 【Java 异常处理】
   是什么：程序运行时出错的处理机制

💻 【异常体系】
   Throwable
   ├── Error（系统级错误，如 OutOfMemoryError）
   └── Exception
       ├── RuntimeException（运行时异常，可处理可不处理）
       │   ├── NullPointerException
       │   ├── ArrayIndexOutOfBoundsException
       │   └── ArithmeticException
       └── CheckedException（编译时异常，必须处理）
           ├── IOException
           └── SQLException

📝 【示例】
   try {
       int result = 10 / 0; // 可能抛异常
   } catch (ArithmeticException e) {
       System.out.println("除零错误：" + e.getMessage());
   } finally {
       System.out.println("无论是否异常都执行");
   }

   // 抛出异常
   public void check(int age) throws IllegalArgumentException {
       if (age < 0) {
           throw new IllegalArgumentException("年龄不能为负数");
       }
   }

⚠️ 【常见坑】
   1. 不要 catch(Exception e) {} 空捕获
   2. 异常要具体捕获，先小后大
   3. finally 中的 return 会覆盖 try 中的 return
```

## 知识卡片格式

对于常用知识点，提供**速查卡片**格式：

```
┌─────────────────────────────────────────────┐
│  💡 Java 基础速查                            │
├─────────────────────────────────────────────┤
│  数据类型：int, long, double, boolean, char │
│  修饰符：public, private, protected, static  │
│  循环：for, while, do-while, for-each       │
│  关键字：this, super, final, void, return   │
│  集合：List/Set/Map → ArrayList/HashMap    │
│  异常：try-catch-finally, throw-throws     │
└─────────────────────────────────────────────┘
```

## 引用索引

| 文件 | 内容 |
|------|------|
| `references/java-basics.md` | 数据类型、变量、运算符、流程控制完整笔记 |
| `references/oop-basics.md` | 面向对象：类、对象、继承、多态、接口 |
| `references/collection-guide.md` | 集合框架详解与选型指南 |
| `references/exception-guide.md` | 异常处理最佳实践 |
| `references/io-guide.md` | IO 流与文件操作 |
| `references/thread-guide.md` | 多线程与并发基础 |
| `references/enum-guide.md` | 枚举使用指南 |
| `references/lambda-guide.md` | Lambda 与 Stream API 入门 |

## 不做

- 不提供完整的 Java 教程（太长）
- 不深入 JVM 原理、内存模型等进阶内容
- 不讲解具体项目开发（那是 java-backend-skill / springboot-init-skill 的事）
- 不回答具体业务代码问题（只回答概念/语法/示例）
- 不提供 IDE 安装使用教程（那是另一套技能）
