#!/usr/bin/env python3
"""fastapi-init-skill 项目生成器。

从 `references/skeleton.md` 和 `references/startup-scripts.md` 提取代码模板，
生成一个完整、立即可运行的 FastAPI 项目。

用法：
    python scripts/generate_project.py --target ./demo --name my-fastapi-app --db mysql
"""

import argparse
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path


SKILL_DIR = Path(__file__).resolve().parent.parent
REFERENCES_DIR = SKILL_DIR / "references"
SKELETON_MD = REFERENCES_DIR / "skeleton.md"
STARTUP_MD = REFERENCES_DIR / "startup-scripts.md"
CONTRACT_TEMPLATE = REFERENCES_DIR / "api-contract-template.md"
GUIDE_TEMPLATE = REFERENCES_DIR / "project-guide-template.md"


def extract_files_from_markdown(md_path: Path, heading_prefix: str = "###"):
    """按标题提取紧随其后的代码块内容。"""
    if not md_path.exists():
        return {}

    lines = md_path.read_text(encoding="utf-8").splitlines()
    files = {}
    i = 0
    while i < len(lines):
        line = lines[i]
        if line.startswith(heading_prefix + " "):
            heading = line[len(heading_prefix) + 1 :].strip()
            # 去掉括号注释，例如 "app/routers/__init__.py（含所有路由导入）"
            heading = re.split(r"[（(]", heading)[0].strip()
            i += 1
            while i < len(lines) and lines[i].strip() == "":
                i += 1
            if i < len(lines) and lines[i].startswith("```"):
                i += 1
                start = i
                while i < len(lines) and lines[i].strip() != "```":
                    i += 1
                files[heading] = "\n".join(lines[start:i])
                i += 1
                continue
        i += 1
    return files


def extract_section_code(md_path: Path, section_title: str):
    """提取二级标题下的第一个代码块（用于 restart.sh / restart.bat）。"""
    lines = md_path.read_text(encoding="utf-8").splitlines()
    i = 0
    while i < len(lines):
        if lines[i].startswith("## ") and lines[i][3:].strip() == section_title:
            i += 1
            while i < len(lines) and lines[i].strip() == "":
                i += 1
            if i < len(lines) and lines[i].startswith("```"):
                i += 1
                start = i
                while i < len(lines) and lines[i].strip() != "```":
                    i += 1
                return "\n".join(lines[start:i])
        i += 1
    return None


def extract_directory_tree(md_path: Path):
    """提取 skeleton.md 中第一个目录结构代码块。"""
    text = md_path.read_text(encoding="utf-8")
    match = re.search(r"```\n(.*?)\n```", text, re.DOTALL)
    return match.group(1) if match else ""


def extract_requirements(md_path: Path) -> str | None:
    """提取二级标题「依赖清单（requirements.txt）」下的第一个代码块。"""
    lines = md_path.read_text(encoding="utf-8").splitlines()
    i = 0
    while i < len(lines):
        if lines[i].startswith("## ") and "依赖清单" in lines[i] and "requirements.txt" in lines[i]:
            i += 1
            while i < len(lines) and lines[i].strip() == "":
                i += 1
            if i < len(lines) and lines[i].startswith("```"):
                i += 1
                start = i
                while i < len(lines) and lines[i].strip() != "```":
                    i += 1
                return "\n".join(lines[start:i])
        i += 1
    return None


def write_text(target: Path, content: str, newline: str = "\n"):
    """按指定换行符写入文本。"""
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(content.replace("\r\n", "\n").replace("\n", newline), encoding="utf-8")


def write_bat(target: Path, content: str):
    """Windows 批处理必须以 UTF-8 with BOM + CRLF 保存，否则中文会乱码。"""
    target.parent.mkdir(parents=True, exist_ok=True)
    body = content.replace("\r\n", "\n").replace("\n", "\r\n")
    target.write_bytes(b"\xef\xbb\xbf" + body.encode("utf-8"))


def write_sh(target: Path, content: str):
    """Shell 脚本使用 LF 换行，并尽量设置可执行权限。"""
    target.parent.mkdir(parents=True, exist_ok=True)
    write_text(target, content, newline="\n")
    try:
        os.chmod(target, os.stat(target).st_mode | 0o111)
    except OSError:
        pass


def fill_contract(content: str, project_name: str, app_port: str) -> str:
    return (
        content.replace("{{PROJECT_NAME}}", project_name)
        .replace("{{APP_PORT}}", app_port)
        .replace("{{DATE}}", datetime.now(timezone.utc).strftime("%Y-%m-%d"))
    )


def fill_guide(content: str, ctx: dict) -> str:
    for key, value in ctx.items():
        content = content.replace(f"{{{{{key}}}}}", value)
    return content


def generate_project(target_dir: Path, project_name: str, db_type: str = "mysql"):
    if target_dir.exists() and any(target_dir.iterdir()):
        print(f"目标目录 {target_dir} 已存在且非空，将继续覆盖源码文件。", file=sys.stderr)

    # 1. 从 skeleton.md 提取源码与配置模板
    skeleton_files = extract_files_from_markdown(SKELETON_MD, "###")

    # 2. 从 startup-scripts.md 提取启动脚本
    restart_sh = extract_section_code(STARTUP_MD, "restart.sh（Linux / macOS）")
    restart_bat = extract_section_code(STARTUP_MD, "restart.bat（Windows）")

    # 3. 写入源码文件
    for heading, content in skeleton_files.items():
        if heading.startswith("app/"):
            rel = heading.replace("/", os.sep)
            write_text(target_dir / rel, content)
        elif heading in (".env.example", ".gitignore"):
            write_text(target_dir / heading, content)
        elif heading in ("Dockerfile", "docker-compose.yml", "docker-compose.pg.yml", "docker-compose.mongo.yml"):
            write_text(target_dir / heading, content)

    # 3.1 写入 requirements.txt
    requirements = extract_requirements(SKELETON_MD)
    if requirements is not None:
        write_text(target_dir / "requirements.txt", requirements)

    if restart_sh:
        write_sh(target_dir / "restart.sh", restart_sh)
    if restart_bat:
        write_bat(target_dir / "restart.bat", restart_bat)

    # 4. 替换占位符
    config_path = target_dir / "app" / "config.py"
    if config_path.exists():
        config_path.write_text(
            config_path.read_text(encoding="utf-8").replace('"{{project}}"', f'"{project_name}"'),
            encoding="utf-8",
        )

    env_example = target_dir / ".env.example"
    if env_example.exists():
        env_example.write_text(
            env_example.read_text(encoding="utf-8").replace("APP_NAME={{project}}", f"APP_NAME={project_name}"),
            encoding="utf-8",
        )

    # 5. 生成 .env（如不存在）
    env_path = target_dir / ".env"
    if not env_path.exists() and env_example.exists():
        env_path.write_bytes(env_example.read_bytes())

    # 6. 生成 api-contract.md
    if CONTRACT_TEMPLATE.exists():
        contract = fill_contract(CONTRACT_TEMPLATE.read_text(encoding="utf-8"), project_name, "8080")
        write_text(target_dir / "api-contract.md", contract)

    # 7. 生成 docs/project-guide.md
    if GUIDE_TEMPLATE.exists():
        tree = extract_directory_tree(SKELETON_MD)
        tree = tree.replace("{{PROJECT_NAME}}", project_name).replace("{{project}}", project_name)
        guide_ctx = {
            "PROJECT_NAME": project_name,
            "PROJECT_DESC": f"{project_name} 项目",
            "DATABASE": "MySQL 8.0" if db_type == "mysql" else ("PostgreSQL 15" if db_type == "postgresql" else ("MongoDB 6" if db_type == "mongodb" else "无数据库")),
            "MIDDLEWARES": "security_headers / request_log / CORS / exception",
            "APP_PORT": "8080",
            "DIRECTORY_TREE": tree,
            "STACK": "Python + FastAPI + SQLAlchemy 2.0 异步 + SSE（sse-starlette）",
            "START_COMMAND": "./restart.sh dev（开发）/ ./restart.sh prod（生产）",
            "LAYER_RESPONSIBILITY": "routers 接请求返回裸数据；models 表映射（SQLAlchemy ORM）；schemas 出入参校验（Pydantic v2）；services 业务逻辑（用户/上传）；utils 工具（JWT/密码）；main 注册中间件/异常/路由/SSE/静态文件",
            "MIDDLEWARE_CHAIN": "security_headers_middleware 安全头 → request_log_middleware 日志 → CORSMiddleware → 路由匹配 → get_current_user 鉴权依赖 → Pydantic v2 校验 → EnvelopeRoute 信封包装（StreamingResponse 自动透传）→ exception_handler 异常兜底",
            "VALIDATION_WAY": "请求体/查询参数用 Pydantic v2 模型 + 类型注解 + Field 约束，失败由 RequestValidationError handler 转 -1001",
            "ENVELOPE_WAY": "EnvelopeRoute 为唯一包装点，handler 返回裸数据；api_response 仅供 exception_handler 兜底；SSE/文件下载等非 JSON 响应自动透传",
            "SSE_WAY": "使用 sse-starlette 的 EventSourceResponse，在路由中 yield 字典即可流式推送；前端用 EventSource API 接收",
            "MODULE_STEPS": "① 更新 api-contract.md → ② app/models/xxx.py → ③ app/schemas/xxx.py → ④ app/services/xxx.py → ⑤ app/routers/xxx.py（APIRouter(route_class=EnvelopeRoute)）→ ⑥ main.py 中 include_router / 静态文件挂载 → ⑦ python -m compileall app + curl 验证",
            "MIDDLEWARE_STEPS": "横切逻辑用 @app.middleware(\"http\")；鉴权/权限类优先用 Depends 依赖注入",
            "ONE_CLICK_WAY": "Linux/macOS 运行 ./restart.sh [dev|prod]，Windows 运行 restart.bat [dev|prod]；脚本自动检测/创建 venv → 安装依赖 → 安全停止旧进程 → 启动服务 → 输出日志命令",
            "MIGRATION_WAY": "开发阶段 lifespan 中 create_all() 自动建表；生产环境请自行安装 Alembic 管理迁移",
            "DB_START_WAY": "MySQL：docker run -d -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=app_db mysql:8.0；PostgreSQL：docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=root -e POSTGRES_DB=app_db postgres:15；MongoDB：docker run -d -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=root -e MONGO_INITDB_ROOT_PASSWORD=root -e MONGO_INITDB_DATABASE=app_db mongo:6；无数据库：将 .env 中 DB_TYPE=none",
            "DB_PREFIX": "wg",
            "DATE": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        }
        guide = fill_guide(GUIDE_TEMPLATE.read_text(encoding="utf-8"), guide_ctx)
        write_text(target_dir / "docs" / "project-guide.md", guide)

    # 8. 生成 README.md 骨架
    readme = f"""# {project_name}

由 `fastapi-init-skill` 生成的 FastAPI 项目。

## 快速开始

```bash
# 开发模式一键启动（自动创建 venv、安装依赖、生成 .env）
./restart.sh dev        # Linux / macOS
restart.bat             # Windows
```

访问：
- Swagger UI: http://localhost:8080/docs
- 健康检查: http://localhost:8080/api/health

详见 `docs/project-guide.md` 和 `api-contract.md`。
"""
    write_text(target_dir / "README.md", readme)

    print(f"项目已生成: {target_dir}")
    print(f"项目名: {project_name}")
    print(f"数据库: {db_type}")


def main():
    parser = argparse.ArgumentParser(description="生成 fastapi-init-skill 项目")
    parser.add_argument("--target", required=True, help="目标目录")
    parser.add_argument("--name", default="my-fastapi-app", help="项目名")
    parser.add_argument("--db", default="mysql", choices=["mysql", "postgresql", "mongodb", "none"], help="数据库类型")
    args = parser.parse_args()
    generate_project(Path(args.target), args.name, args.db)


if __name__ == "__main__":
    main()
