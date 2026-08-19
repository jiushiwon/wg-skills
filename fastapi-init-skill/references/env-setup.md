# 环境探测与自动安装

生成项目前，必须先检测用户本地环境；不满足条件时给出中文提示与安装指引。

## 探测流程

```
开始
  │
  ├─ 1. 检测操作系统
  │     ├─ Linux → 用 shell 脚本
  │     ├─ macOS → 用 shell 脚本
  │     └─ Windows → 用 bat/powershell 脚本
  │
  ├─ 2. 检测 Python
  │     ├─ python --version / python3 --version
  │     ├─ 未安装 → 提示下载 https://python.org/downloads
  │     ├─ 版本 < 3.9 → 提示升级
  │     └─ 版本 >= 3.9 → ✓
  │
  ├─ 3. 检测 pip
  │     ├─ pip --version / pip3 --version
  │     ├─ 未安装 → python -m ensurepip --upgrade
  │     └─ ✓
  │
  ├─ 4. 检测虚拟环境
  │     ├─ 已有 venv/ → 询问是否重建
  │     ├─ 无 → 创建 python -m venv venv
  │     └─ 激活（见下方表格）
  │
  └─ 5. 安装依赖
        └─ pip install -r requirements.txt
```

## 操作系统检测

```python
import platform

system = platform.system()  # "Windows" / "Darwin" / "Linux"
is_windows = system == "Windows"
is_macos = system == "Darwin"
is_linux = system == "Linux"
```

## 虚拟环境激活命令

| 操作系统 | Shell | 激活命令 |
|----------|-------|----------|
| Linux / macOS | bash/zsh | `source venv/bin/activate` |
| Windows | CMD | `venv\Scripts\activate.bat` |
| Windows | PowerShell | `venv\Scripts\Activate.ps1` |
| Windows | Git Bash | `source venv/Scripts/activate` |

## Python 版本检查

生成时检查 Python 版本是否 >= 3.9：

```python
import sys

major, minor = sys.version_info[:2]
if (major, minor) < (3, 9):
    print(f"当前 Python {major}.{minor} 版本过低，需要 >= 3.9")
    print("请访问 https://python.org/downloads 下载最新版本")
    sys.exit(1)
```

## 依赖版本获取（不写死）

优先级：本机已装版本 → PyPI 官方最新稳定 → 允许用户覆盖 → 写入 `versions.md`。

查询 PyPI 最新版本：

```bash
# fastapi
curl -s https://pypi.org/pypi/fastapi/json | python -c "import sys,json; print(json.load(sys.stdin)['info']['version'])"

# uvicorn
curl -s https://pypi.org/pypi/uvicorn/json | python -c "import sys,json; print(json.load(sys.stdin)['info']['version'])"

# pydantic
curl -s https://pypi.org/pypi/pydantic/json | python -c "import sys,json; print(json.load(sys.stdin)['info']['version'])"

# sqlalchemy
curl -s https://pypi.org/pypi/sqlalchemy/json | python -c "import sys,json; print(json.load(sys.stdin)['info']['version'])"

# sse-starlette
curl -s https://pypi.org/pypi/sse-starlette/json | python -c "import sys,json; print(json.load(sys.stdin)['info']['version'])"

# motor (MongoDB 时)
curl -s https://pypi.org/pypi/motor/json | python -c "import sys,json; print(json.load(sys.stdin)['info']['version'])"
```

## Windows 特殊处理

1. **长路径支持**：Windows 默认路径长度限制 260 字符，可能导致 venv 创建失败。提示用户启用长路径：
   ```
   如果遇到路径太长错误，请以管理员身份运行 PowerShell 并执行：
   New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
   ```

2. **PowerShell 执行策略**：如果 `Activate.ps1` 无法运行：
   ```
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

3. **Python 未加入 PATH**：安装时勾选 "Add Python to PATH"，否则脚本无法找到 python 命令。

## 常见问题排错

| 问题 | 原因 | 解决 |
|------|------|------|
| 启动后提示 `Can't connect to MySQL` | 数据库未启动 | `docker compose up -d mysql`；或检查 `.env` 连接信息 |
| 启动后提示 `JWT_SECRET` 相关警告 | 未修改默认密钥 | 编辑 `.env`，将 `JWT_SECRET` 改为随机字符串 |
| `.env` 文件不存在 | 首次使用未运行 `setup.sh` | 运行 `cp .env.example .env` 或重新执行 `./setup.sh` |
| `pip install` 报 SSL 错误 | 系统 CA 证书过期 | Windows: 重新下载 Python 安装包并勾选 "Install certificates" |
| `pip install mysqlclient` 报错 | 缺少 MySQL 开发库 | 本项目用 `pymysql + aiomysql`，不需要 `mysqlclient` |
| `pip install psycopg2` 报错 | 缺少 PostgreSQL 开发库 | 本项目用 `psycopg2-binary + asyncpg`，不需要编译 |
| 端口 8080 被占用 | 其他程序占了端口 | 修改 `.env` 中 `APP_PORT` 或停掉占用程序 |
| `uvicorn` 命令找不到 | venv 未激活或未安装 | 激活 venv 后重试；或用 `python -m uvicorn` |
| 生产环境 Swagger 仍暴露 | 未关闭文档接口 | 修改 `main.py` 中 `docs_url=None, redoc_url=None` |
| 数据库连接间歇性断开 | 连接池无保活 | 已内置 `pool_pre_ping` 和 `pool_recycle`，若仍断开请检查数据库空闲超时配置 |
| 日志文件占满磁盘 | 无日志轮转 | Linux 使用 `logrotate`，或配置 `logging.handlers.RotatingFileHandler` |

## AI 生成时的环境探测话术

当检测到用户环境不满足条件时，AI 应输出以下中文提示：

### Python 未安装
```
⚠️ 未检测到 Python。请先安装 Python 3.9 或更高版本：
   📥 下载地址：https://python.org/downloads
   ✅ 安装时请勾选 "Add Python to PATH"
   安装完成后，重新打开终端，再运行本命令。
```

### Python 版本过低
```
⚠️ 当前 Python {{current}} 版本过低，需要 >= 3.9。
   💡 建议安装 Python 3.11 或 3.12（稳定版）：
   📥 https://python.org/downloads
```

### pip 未安装
```
⚠️ pip 未安装或不可用。执行以下命令修复：
   python -m ensurepip --upgrade
```

### 数据库连接失败（首次启动后）
```
⚠️ 数据库连接失败。请检查：
   1. 数据库是否已启动（Docker: docker compose up -d mysql）
   2. .env 文件中的数据库连接信息是否正确
   3. 防火墙是否放行了数据库端口
   💡 如果没有本地数据库，可以用 Docker 快速启动：
      docker compose up -d mysql
```

## 自动安装后验证

生成项目后，AI 应自动执行以下验证：

```bash
# 1. 编译检查
python -m compileall app

# 2. 启动服务（后台）
uvicorn app.main:app --host 0.0.0.0 --port 8080 &
sleep 2

# 3. 接口验证
curl -s http://localhost:8080/api/health
# 预期：{ "code": 0, "message": "success", "data": { "status": "ok" } }

# 4. SSE 验证
curl -s http://localhost:8080/api/sse/chat
# 预期：SSE 格式的流式文本

# 5. 停止服务
kill %1
```
