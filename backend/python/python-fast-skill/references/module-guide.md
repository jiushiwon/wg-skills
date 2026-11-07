# Python 模块与包管理

> import 机制、包结构、pip / uv / poetry、虚拟环境、发布。回答「Python 模块」「Python 包」「pip」「虚拟环境」类问题时读本文。

---

## 一、import 基础

```python
import os                    # 导入整个模块
import os.path               # 导入子模块
import numpy as np           # 起别名
from pathlib import Path     # 从模块导入某个名字
from pathlib import Path as P
from . import sibling        # 导入同级模块（相对导入，必须在包内）
from .models import User     # 从同级子模块导入
from ..parent import x       # 上一级（相对导入层级受限，不推荐跨包用）
```

**绝对导入 vs 相对导入**：包内部优先用相对导入（`.`），跨包一律用绝对导入。

```python
# 标准库
import os
from datetime import datetime

# 第三方
import httpx
from pydantic import BaseModel

# 本地项目（推荐 src 布局下的绝对导入）
from my_app.config import settings
```

---

## 二、`__name__ == "__main__"`

```python
def main() -> None:
    print("运行主逻辑")

if __name__ == "__main__":
    main()
```

**意义**：文件被直接运行时执行，被 import 时不执行。

**必须写的情况**：
- 作为脚本入口；
- Windows / macOS 上使用 `multiprocessing` 的进程池（否则无限创建子进程）。

---

## 三、包结构

```
my_project/
├── pyproject.toml           # 项目元数据 + 依赖（现代标准）
├── README.md
├── src/
│   └── my_project/
│       ├── __init__.py      # 包标记文件（Python 3.3+ 可省略，但建议保留）
│       ├── main.py
│       ├── config.py
│       └── models/
│           ├── __init__.py
│           └── user.py
└── tests/
    └── test_main.py
```

⚠️ **每个目录要能被当包导入，就需要 `__init__.py`**（Python 3.3+ 的命名空间包可以省略，但可读性和工具兼容性会变差，建议保留）。

### `__init__.py` 里放什么

```python
# my_project/__init__.py
"""我的项目。"""

__version__ = "0.1.0"

from .models.user import User      # 暴露公共 API（可选）

__all__ = ["User", "__version__"]
```

⚠️ **不要在 `__init__.py` 里写大量代码** —— 它会在每次 import 子模块时被执行，容易造成循环导入和启动变慢。

### 循环导入

```python
# a.py
from b import B

# b.py
from a import A      # ❌ 循环导入
```

解法：把公共定义放到独立的模块（如 `common.py`），或延迟到函数内部 import。

---

## 四、包管理工具

### 4.1 pip（官方）

```bash
pip install requests
pip install "requests>=2.31,<3"       # 版本约束
pip install -r requirements.txt
pip install -e .                       # 可编辑安装（开发自己的包）
pip uninstall requests
pip list
pip show requests
pip freeze > requirements.txt
pip check                             # 检查依赖冲突
```

### 4.2 uv（现在推荐）

Rust 编写，比 pip 快 10 倍以上，且统一了虚拟环境、版本管理、依赖锁定。

```bash
uv python install 3.12          # 安装指定 Python 版本
uv python pin 3.12              # 在项目里固定版本
uv venv                         # 创建虚拟环境
uv init my-project              # 初始化项目（生成 pyproject.toml）
uv add requests pandas          # 添加依赖（自动写入 pyproject.toml）
uv remove requests
uv sync                         # 按锁文件同步环境
uv sync --frozen                # CI 用，不更新锁文件
uv run python main.py           # 在项目环境里执行
uv lock --upgrade                # 更新锁文件
```

### 4.3 poetry / pipenv

功能与 uv 重叠（依赖声明、锁定、虚拟环境），生态成熟但速度慢。**新项目优先 uv。**

### 4.4 conda

除了 Python 包还能管非 Python 依赖（CUDA、MKL 等）。**做 AI / 科学计算且依赖 GPU 环境时用 conda**，纯 Web 项目用 uv。

---

## 五、虚拟环境

**每个项目一个虚拟环境**，这是硬规则。

```bash
# 创建
python3 -m venv .venv
uv venv

# 激活（Linux / macOS）
source .venv/bin/activate

# 激活（Windows PowerShell）
.venv\Scripts\Activate.ps1

# 激活（Windows CMD）
.venv\Scripts\activate.bat

# 退出
deactivate

# 查看当前用的是哪个 Python
which python        # Linux / macOS
where python        # Windows
python -c "import sys; print(sys.executable)"
```

⚠️ **常见事故**：没激活虚拟环境就 `pip install`，结果装到了系统 Python 里，项目却找不到。养成习惯：**先看 `which python` 再装**。

### requirements.txt

```txt
fastapi>=0.115,<1.0
uvicorn[standard]>=0.32
pydantic>=2.9
```

```bash
pip install -r requirements.txt
pip freeze > requirements.txt
```

生产环境建议用 `pyproject.toml` + 锁文件（`uv.lock` / `poetry.lock`），保证可复现。

---

## 六、pyproject.toml

```toml
[project]
name = "my-app"
version = "0.1.0"
description = "我的应用"
requires-python = ">=3.11"
dependencies = [
    "fastapi>=0.115",
    "uvicorn[standard]>=0.32",
    "pydantic>=2.9",
]

[project.optional-dependencies]
dev = ["pytest>=8.0", "ruff>=0.7", "mypy>=1.13"]

[project.scripts]
my-app = "my_app.cli:main"

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.ruff]
line-length = 100

[tool.ruff.lint]
select = ["E", "F", "I", "UP", "B"]

[tool.pytest.ini_options]
testpaths = ["tests"]
```

**可编辑安装**（开发自己的包时用）：

```bash
pip install -e .
```

---

## 七、发布到 PyPI

```bash
uv build                 # 产出 dist/*.whl 和 *.tar.gz
uv publish               # 上传（需先在 PyPI 配置 API Token）
```

---

## 八、常见坑速查

| 坑 | 说明 | 正解 |
|---|---|---|
| 忘激活虚拟环境 | 包装到系统 Python | 先 `which python` 确认 |
| 多个项目共用一个环境 | 依赖互相打架 | 每项目一个 venv |
| `from x import *` | 污染命名空间、难追踪 | 显式导入 |
| `__init__.py` 里写太多代码 | 循环导入、启动慢 | 只放包元数据和公共 API |
| `sys.path.append` 拼路径 | 换机器就崩 | 用 `pip install -e .` + 绝对导入 |
| 模块名与标准库冲突 | 如 `random.py` 遮蔽标准库 | 改用业务前缀命名 |
| 依赖不锁版本 | 同事装的版本和你不一样 | 用 `pyproject.toml` + 锁文件 |
| 目录里有 `__pycache__` 被提交 | 污染仓库 | 加进 `.gitignore` |

`.gitignore` 标准片段：

```gitignore
.venv/
__pycache__/
*.py[cod]
.env
*.egg-info/
dist/
build/
.pytest_cache/
.mypy_cache/
.ruff_cache/
```

---

## 相关文档

- [function-guide.md](function-guide.md) — 装饰器与函数
- [io-guide.md](io-guide.md) — 配置文件读取
