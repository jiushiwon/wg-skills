#!/usr/bin/env python3
"""
springboot-init-skill canonical 项目生成器。

从 references/*.md 提取代码块，按章节标题解析路径，
写入目标项目目录。

⚠️ 仅作 canonical 参考实现 + 维护者 dogfooding 工具。
   Claude 模型在生成项目时应按 references 现场生成，而非必须运行本脚本。

用法：
    python scripts/generate_project.py \\
        --project my-app \\
        --db-type mysql \\
        --output /tmp/my-app \\
        --references-dir ../references
"""
import argparse
import os
import re
import sys
from pathlib import Path


# ---------------------------------------------------------------------------
# 占位符替换
# ---------------------------------------------------------------------------

def to_base_package(project: str) -> str:
    """my-app -> com.koala.myapp（技能默认包名前缀）"""
    camel = project.replace("-", "").replace("_", "")
    return f"com.koala.{camel}"


def to_base_package_path(base_package: str) -> str:
    return base_package.replace(".", "/")


def db_dependencies(db_type: str) -> str:
    """根据数据库类型生成 pom.xml 中的依赖块。"""
    if db_type == "mysql":
        return """        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>"""
    if db_type == "postgres":
        return """        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>"""
    if db_type == "mongo":
        return """        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-mongodb</artifactId>
        </dependency>"""
    return """        <!-- 未启用数据库：如需要 JPA，请取消下面注释并引入对应驱动
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        -->"""


def redis_dependency(redis: bool) -> str:
    """Redis 依赖块。"""
    if not redis:
        return "        <!-- Redis 未启用 -->"
    return """        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-redis</artifactId>
        </dependency>"""


def flyway_dependencies(db_type: str) -> str:
    """Flyway 依赖块（仅关系型数据库启用）。"""
    if db_type == "mysql":
        return """        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-core</artifactId>
        </dependency>
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-mysql</artifactId>
        </dependency>"""
    if db_type == "postgres":
        return """        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-core</artifactId>
        </dependency>
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-database-postgresql</artifactId>
        </dependency>"""
    return "        <!-- 当前数据库类型不启用 Flyway -->"


def replace_placeholders(content: str, project: str, base_package: str,
                         table_prefix: str = "wg",
                         db_type: str = "mysql",
                         orm: str = "Spring Data JPA",
                         redis: bool = False) -> str:
    base_package_path = to_base_package_path(base_package)
    return (content
            .replace("{{PROJECT_NAME}}", project)
            .replace("{{project}}", project)
            .replace("{{basePackagePath}}", base_package_path)
            .replace("{{basePackage}}", base_package)
            .replace("{{tablePrefix}}", table_prefix)
            .replace("{{dbType}}", db_type)
            .replace("{{DB_DEPS}}", db_dependencies(db_type))
            .replace("{{REDIS_DEP}}", redis_dependency(redis))
            .replace("{{FLYWAY_DEPS}}", flyway_dependencies(db_type))
            .replace("{{orm}}", orm))


# ---------------------------------------------------------------------------
# Markdown 章节解析
# ---------------------------------------------------------------------------

# 匹配：### 文件标题 \n 任意文本 ```任意语言 \n 代码 \n ```
SECTION_RE = re.compile(
    r"###\s+([^\n]+?)\s*\n.*?```[a-zA-Z_-]*\n(.*?)\n```",
    re.DOTALL,
)


def extract_sections(markdown_path: Path) -> dict[str, str]:
    """章节标题 -> 代码块内容。"""
    text = markdown_path.read_text(encoding="utf-8")
    return {match.group(1).strip(): match.group(2)
            for match in SECTION_RE.finditer(text)}


def strip_code_fence(markdown: str) -> str:
    """剥离顶层 ```markdown ... ``` 包装。"""
    m = re.match(r"^```(?:markdown)?\n(.*)\n```\s*$", markdown, re.DOTALL)
    return m.group(1) if m else markdown


# ---------------------------------------------------------------------------
# 文件路径推断
# ---------------------------------------------------------------------------

def detect_path(title: str, base_package_path: str) -> str | None:
    """
    把 markdown 章节标题映射到项目内路径。

    规则：
    - 含 / 的（如 common/ApiResponse.java）：按字面拼到 java 根目录
    - 仅文件名（如 Application.java）：按后缀推断
    - 多文件合并标题（"a.java + b.java"）：返回 None，调用方跳过
    """
    t = title.strip()

    # 合并标题：a.java + b.java
    if re.search(r"\+\s*\S+\.\w+", t):
        return None

    # 通配标题：dto/user/*
    if "*" in t:
        return None

    # 去掉中文括号备注：docker-compose.yml（默认 MySQL） -> docker-compose.yml
    t = re.sub(r"（.*?）|\(.*?\)", "", t).strip()

    if not t:
        return None

    # 含 / 的标题
    if "/" in t:
        # 标题已包含完整目标路径，直接复用
        if t.startswith(("src/main/java/", "src/main/resources/", "src/test/java/", "src/test/resources/")):
            return t
        if t.endswith(".java"):
            return f"src/main/java/{base_package_path}/{t}"
        if t.endswith(".sql"):
            return f"src/main/resources/{t}"
        if t.endswith((".yml", ".yaml")):
            return f"src/main/resources/{t}"
        return t

    # 单文件名
    if t.endswith(".java"):
        # 测试入口固定放到 test 目录
        if t == "ApplicationTests.java":
            return f"src/test/java/{base_package_path}/{t}"
        return f"src/main/java/{base_package_path}/{t}"
    if t.endswith((".yml", ".yaml")):
        # application.yml / application-*.yml 进 resources，其他放根目录
        if t == "application.yml" or t.startswith("application-"):
            return f"src/main/resources/{t}"
        return t
    if t in {"Dockerfile", "README.md", ".gitignore", ".env.example",
             "pom.xml", "mvnw", "mvnw.cmd"}:
        return t
    if t.startswith("docker-compose"):
        return t
    if re.match(r"^V\d+__", t) and t.endswith(".sql"):
        return f"src/main/resources/db/migration/{t}"
    if t.endswith(".bat"):
        return t
    if t.endswith(".sh"):
        return t

    return None


# ---------------------------------------------------------------------------
# 文件写入（含 BOM/CRLF 处理）
# ---------------------------------------------------------------------------

def write_file(target: Path, content: str, *, bom: bool = False, crlf: bool = False):
    target.parent.mkdir(parents=True, exist_ok=True)
    raw = content.encode("utf-8")
    if crlf:
        raw = raw.replace(b"\r\n", b"\n").replace(b"\n", b"\r\n")
    if bom:
        raw = b"\xef\xbb\xbf" + raw
    target.write_bytes(raw)


# ---------------------------------------------------------------------------
# 主流程
# ---------------------------------------------------------------------------

def generate(args):
    project = args.project
    db_type = args.db_type
    redis = args.redis == "yes"
    base_package = args.base_package or to_base_package(project)
    base_package_path = to_base_package_path(base_package)
    output_dir = Path(args.output).resolve()
    refs_dir = Path(args.references_dir).resolve()
    orm = "Spring Data MongoDB" if db_type == "mongo" else "Spring Data JPA"

    print(f"📦 生成项目: {project}")
    print(f"   包名:     {base_package}")
    print(f"   ORM:      {orm}")
    print(f"   数据库:   {db_type}")
    print(f"   Redis:    {'启用' if redis else '未启用'}")
    print(f"   输出目录: {output_dir}")
    print()

    written, skipped = [], []

    # 1. skeleton.md —— 所有源码 + 配置文件
    skeleton_md = refs_dir / "skeleton.md"
    if skeleton_md.exists():
        for title, code in extract_sections(skeleton_md).items():
            rel = detect_path(title, base_package_path)
            if not rel:
                skipped.append(f"skeleton.md: {title}")
                continue
            content = replace_placeholders(code, project, base_package, db_type=db_type, orm=orm, redis=redis)
            target = output_dir / rel
            is_bat = rel.endswith(".bat")
            write_file(target, content, bom=is_bat, crlf=is_bat)
            written.append(rel)

    # 2. startup-scripts.md —— restart.sh / restart.bat
    scripts_md = refs_dir / "startup-scripts.md"
    if scripts_md.exists():
        for title, code in extract_sections(scripts_md).items():
            t = re.sub(r"（.*?）|\(.*?\)", "", title).strip()
            if t in {"restart.sh", "restart.bat"}:
                content = replace_placeholders(code, project, base_package, db_type=db_type, orm=orm, redis=redis)
                target = output_dir / t
                is_bat = t.endswith(".bat")
                write_file(target, content, bom=is_bat, crlf=is_bat)
                if not is_bat:
                    os.chmod(target, 0o755)
                written.append(t)

    # 3. api-contract.md —— 整体 markdown 内容
    contract_tpl = refs_dir / "api-contract-template.md"
    if contract_tpl.exists():
        raw = strip_code_fence(contract_tpl.read_text(encoding="utf-8"))
        content = replace_placeholders(raw, project, base_package)
        target = output_dir / "api-contract.md"
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(content, encoding="utf-8")
        written.append("api-contract.md")

    # 4. docs/project-guide.md
    guide_tpl = refs_dir / "project-guide-template.md"
    if guide_tpl.exists():
        raw = strip_code_fence(guide_tpl.read_text(encoding="utf-8"))
        content = replace_placeholders(raw, project, base_package)
        target = output_dir / "docs" / "project-guide.md"
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(content, encoding="utf-8")
        written.append("docs/project-guide.md")

    # 5. .env（从 skeleton.md 的 .env.example 复制）
    skeleton_env_example = output_dir / ".env.example"
    if skeleton_env_example.exists():
        env_target = output_dir / ".env"
        env_target.write_text(skeleton_env_example.read_text(encoding="utf-8"),
                              encoding="utf-8")
        written.append(".env")

    # 输出报告
    print(f"✅ 写入 {len(written)} 个文件：")
    for p in written:
        print(f"  ✓ {p}")

    if skipped:
        print()
        print(f"⚠️ 跳过 {len(skipped)} 个章节（标题含 '+/多文件'，需手动拆）：")
        for s in skipped:
            print(f"  - {s}")

    print()
    print("🚀 下一步：")
    print(f"  cd {output_dir}")
    print("  docker-compose up -d   # 启动数据库")
    print("  ./restart.sh dev        # 开发模式")


def main():
    p = argparse.ArgumentParser(
        description="springboot-init-skill canonical 项目生成器")
    p.add_argument("--project", required=True, help="项目名（kebab-case）")
    p.add_argument("--base-package", default=None,
                   help="Maven groupId / Java 包名（默认 com.koala.{project}）")
    p.add_argument("--db-type", default="mysql",
                   choices=["mysql", "postgres", "mongo", "none"])
    p.add_argument("--redis", default="no",
                   choices=["yes", "no"],
                   help="是否引入 Redis（默认 no）")
    p.add_argument("--output", required=True, help="输出目录")
    p.add_argument("--references-dir",
                   default=str(Path(__file__).resolve().parent.parent / "references"))
    args = p.parse_args()
    generate(args)


if __name__ == "__main__":
    main()