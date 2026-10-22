# Python 文件与 IO

> 文件读写、with 语句、JSON / YAML / TOML、pathlib 路径处理、CSV、二进制。回答「Python 文件读写」「Python IO」「pathlib」「JSON」类问题时读本文。

---

## 一、open() 与 with

```python
# 打开模式
# r  只读（默认）      w  覆盖写（会清空文件）     a  追加写
# x  独占创建（文件已存在则报错）                     b  二进制
# +  读写
```

```python
# ✅ 永远用 with：自动关闭，异常时也关
with open("data.txt", "r", encoding="utf-8") as f:
    content = f.read()

# 逐行读取（文件大时用这个，不要一次 read 全部）
with open("data.txt", "r", encoding="utf-8") as f:
    for line in f:
        print(line.rstrip())
```

⚠️ **两个必写的参数**：

- `encoding="utf-8"` —— 不写就用系统默认编码，Windows 中文环境下会乱码；
- 写模式的 `newline=""` —— 写 CSV 时避免出现多余空行。

```python
with open("out.csv", "w", encoding="utf-8", newline="") as f:
    f.write("name,age\n")
```

---

## 二、读取方式

```python
f.read()            # 读全部（字符串）
f.read(1024)        # 读 1024 字符
f.readline()        # 读一行（含换行符）
f.readlines()       # 读所有行，返回 list
f.readinto(buf)     # 读入缓冲区（二进制）

for line in f:      # 迭代行，大文件首选
    ...
```

### 二进制模式

```python
with open("logo.png", "rb") as f:
    data = f.read()

with open("out.bin", "wb") as f:
    f.write(data)
```

---

## 三、pathlib：现代路径处理

比字符串拼接强得多，强烈推荐。

```python
from pathlib import Path

p = Path("data") / "2024" / "orders.csv"     # 拼接路径

p.exists()          # 是否存在
p.is_dir()          # 是目录
p.is_file()         # 是文件
p.stat().st_size    # 文件大小（字节）
p.suffix            # ".csv"
p.stem              # "orders"
p.parent            # 上级目录
p.name              # "orders.csv"

p.parent.mkdir(parents=True, exist_ok=True)   # 递归建目录
p.rename("new.csv")                          # 重命名
p.unlink(missing_ok=True)                    # 删除（不存在也不报错）
```

### 遍历目录

```python
# 当前目录下所有 .csv
for f in Path(".").glob("*.csv"):
    print(f)

# 递归找所有 py 文件
for f in Path("src").rglob("*.py"):
    print(f)

# 目录树
for dirpath, dirnames, filenames in Path(".").walk():
    ...
```

### 读文件（pathlib 自带方法）

```python
text = Path("a.txt").read_text(encoding="utf-8")
data = Path("a.bin").read_bytes()
Path("b.txt").write_text("内容", encoding="utf-8")
```

---

## 四、JSON

```python
import json

# 读
with open("config.json", "r", encoding="utf-8") as f:
    config = json.load(f)

# 写
data = {"name": "考拉", "age": 10, "tags": ["a", "b"]}
with open("config.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

# 紧凑格式（写日志、缓存时用）
s = json.dumps(data, ensure_ascii=False, separators=(",", ":"))

# 反序列化
obj = json.loads(s)
```

⚠️ **`ensure_ascii=False`** —— 不加的话中文会变成 `中文`，可读性极差。

### 标准库更简洁的写法

```python
from pathlib import Path
import json

config = json.loads(Path("config.json").read_text(encoding="utf-8"))
Path("out.json").write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
```

---

## 五、CSV

```python
import csv

# 读
with open("orders.csv", "r", encoding="utf-8", newline="") as f:
    reader = csv.DictReader(f)          # 每行是 dict
    for row in reader:
        print(row["name"], row["amount"])

# 写
with open("out.csv", "w", encoding="utf-8", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["name", "amount"])
    writer.writeheader()
    writer.writerow({"name": "考拉", "amount": 100})
```

⚠️ 用 `csv` 模块而不是 `split(",")` —— 字段里有逗号、引号、换行时 `split` 会全错。

---

## 六、YAML / TOML

```python
# YAML（需 pip install pyyaml）
import yaml
with open("config.yaml", "r", encoding="utf-8") as f:
    config = yaml.safe_load(f)           # ✅ safe_load，不要用 load

# TOML（Python 3.11+ 标准库 tomllib，只读）
import tomllib
with open("pyproject.toml", "rb") as f:
    config = tomllib.load(f)
```

---

## 七、常见坑速查

| 坑 | 说明 | 正解 |
|---|---|---|
| 忘记 `with` | 文件句柄泄漏，Windows 上删不掉文件 | 一律用 `with` |
| 不写 `encoding` | Windows 下中文乱码 | 显式 `encoding="utf-8"` |
| `json.dump` 忘 `ensure_ascii=False` | 中文变 `\uXXXX` | 加上该参数 |
| `yaml.load` | 可执行任意代码 | 用 `yaml.safe_load` |
| `open("w")` 忘了会清空 | 原文件被覆盖 | 追加用 `"a"` |
| 大文件 `read()` 一次性读 | 内存爆掉 | 逐行迭代 / 分块读 |
| 用 `split(",")` 解析 CSV | 字段含逗号就错 | 用 `csv` 模块 |
| 路径硬编码 `/` | Windows 下失效 | 用 `pathlib.Path` |

---

## 相关文档

- [exception-guide.md](exception-guide.md) — `with` 与异常的关系
- [module-guide.md](module-guide.md) — 标准库导入方式
