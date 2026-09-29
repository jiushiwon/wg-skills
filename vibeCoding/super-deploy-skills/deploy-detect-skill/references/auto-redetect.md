# 项目变更自动重新检测

本文件定义 `deploy-detect-skill` 如何支持「项目变更后自动重新检测」，落地用户「每次当项目变更会自动进行检测」的需求。框架级 skill 不内置文件监听 daemon，改为提供可接入 git hook / CI 的标准入口。

## 触发入口

重新检测与首次检测共用同一入口：

```
/deploy-detect-skill
```

或自然语言「重新检测部署画像」。区别在于：重新检测会读取已有的 `deploy-profile.md`，对比新旧结果，标注「变化项」。

## 三种自动化方式

### 方式 A：git post-merge hook（本地/服务器拉代码后自动跑）

适用于部署服务器上 `git pull` 后自动刷新画像。

`.git/hooks/post-merge`（或服务器 bare repo 的 `post-receive`）：

```bash
#!/usr/bin/env bash
# ponytail: minimal re-detect trigger; expand to CI if multi-host
set -e

PROFILE="deploy-profile.md"
CHANGED=$(git diff --name-only HEAD@{1} HEAD -- \
  package.json package-lock.json pnpm-lock.yaml yarn.lock \
  pom.xml build.gradle go.mod go.sum \
  requirements.txt pyproject.toml Pipfile \
  Dockerfile docker-compose.yml .env.example)

if [ -n "$CHANGED" ]; then
  echo "[deploy-detect] stack-affecting files changed:"
  echo "$CHANGED"
  echo "[deploy-detect] please re-run /deploy-detect-skill to refresh ${PROFILE}"
  # 如接入 Claude Code，可在此触发 headless 调用（见下）
fi
```

赋予执行权限：

```bash
chmod +x .git/hooks/post-merge
```

> hook 默认只「提醒」，不自动改画像，避免误覆盖。如需自动刷新，见方式 C 的 headless 调用。

### 方式 B：CI job（合并到 main 后在流水线跑）

GitHub Actions `.github/workflows/deploy-detect.yml`：

```yaml
name: deploy-detect
on:
  push:
    branches: [main]
    paths:
      - 'package.json'
      - 'pom.xml'
      - 'go.mod'
      - 'requirements.txt'
      - 'pyproject.toml'
      - 'Dockerfile'
      - 'docker-compose.yml'
      - '.env.example'

jobs:
  detect:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Re-detect deploy profile
        run: |
          echo "Stack-affecting files changed on main; re-run deploy-detect-skill."
          # 接入 Claude Code headless（如已配置）：
          # claude -p "/deploy-detect-skill 重新检测并写入 deploy-profile.md"
```

GitLab CI 等价：用 `rules:changes` 监听同一组文件。

### 方式 C：Claude Code headless 自动刷新

如环境已配置 Claude Code，可在 hook/CI 里直接 headless 调用，自动重写 `deploy-profile.md`：

```bash
claude -p "/deploy-detect-skill 重新检测，覆盖 deploy-profile.md，标注变化项" \
  --allowedTools "Read,Glob,Grep,Write,Edit"
```

> 仅开放只读 + 写画像文件所需工具，禁止 `Bash` 执行安装/部署，保持安全边界。

## 重新检测的输出差异

重新检测时，在 `deploy-profile.md` 顶部追加「变化摘要」：

```markdown
## 变化摘要（2026-07-10 重新检测）
- 新增依赖：Redis（package.json 新增 ioredis）→ 部署需求追加「需要缓存 Redis 7」
- 版本变化：Node.js 18 → 22（.nvmrc 变更）→ 运行时升级到 22
- 移除：无
```

下游 skill 读取画像时，优先看「变化摘要」决定是否需要重新生成脚本。

## 推荐落地策略

| 场景 | 推荐方式 |
|------|----------|
| 个人项目 / 单服务器 | 方式 A（post-merge 提醒） |
| 团队 / 多环境 | 方式 B（CI job 校验画像过期） |
| 已接入 Claude Code 自动化 | 方式 C（headless 自动刷新） |

## 与「检测时间」的配合

`deploy-profile.md` 顶部的「检测时间」是过期判断依据：

- 下游 skill 读取画像时，若发现「检测时间」早于最近 `package.json`/`pom.xml` 等标志性文件的 mtime，提示「画像可能过期，建议重新检测」。
- 该提示是软提醒，不阻断流程。
