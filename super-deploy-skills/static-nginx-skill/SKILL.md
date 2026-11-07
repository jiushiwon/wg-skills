---
name: static-nginx-skill
description: 用于处理 Vue/React/Angular/Svelte 等前端构建产物或纯静态资源的部署，检测目标服务器是否安装 Nginx，生成 Nginx 安装命令与站点配置（SPA 路由 fallback、纯静态托管、API 反向代理、HTTPS）。区分开发构建与生产部署。当用户说「静态文件部署」「nginx 部署」「vue 部署」「react 部署」「前端部署到服务器」时触发。
---

# Static Nginx Skill

## Overview

本 skill 专注「前端静态产物如何托管到 Nginx」。它读取 `deploy-profile.md` 判断项目是否包含前端构建产物（Vue / React / Angular / Svelte / 纯 HTML），检测 Nginx 是否安装，生成对应 OS 的安装命令与站点配置。

它不替代构建：构建命令由 `deploy-native-skill` 或 `deploy-docker-skill` 负责；本 skill 只负责「构建产物 → Nginx 托管」这一段。

## When to Use

触发词：

- `静态文件部署`
- `nginx 部署`
- `vue 部署`
- `react 部署`
- `前端部署到服务器`
- `配置 nginx 托管静态文件`

前置依赖：建议先运行 `deploy-detect-skill`，确认项目确实包含前端构建产物。如画像标注「需要反向代理：否」，本 skill 提示「当前项目未检测到前端产物，是否仍要配置 Nginx」。

## Workflow Summary

```
Phase 1: 读取 deploy-profile.md
  → 判断前端构建产物类型（SPA / 纯静态 / SSR）
  → 提取构建产物目录（dist / build / .next / public）

Phase 2: 检测 Nginx 是否安装
  → nginx -v
  → 检查默认配置路径（/etc/nginx/ vs C:\nginx\conf）

Phase 3: 生成 Nginx 安装命令（如缺失）
  → 按 OS 输出 apt / yum / dnf / apk / brew / winget 命令

Phase 4: 生成站点配置
  → SPA：try_files $uri /index.html（history 模式）
  → 纯静态：root 指向产物目录
  → 反向代理：location /api proxy_pass 到后端
  → HTTPS：可选 ssl_certificate 片段

Phase 5: 部署步骤
  → 拷贝产物到 Nginx 可访问目录
  → 写入站点配置并重载 Nginx
  → 健康检查
```

## Phase 1: 读取 deploy-profile.md

从画像的「前端构建产物」行判断类型：

| 产物类型 | 框架 | 产物目录 | Nginx 配置策略 |
|----------|------|----------|----------------|
| SPA | Vue / React / Angular / Svelte | dist / build | history fallback |
| 纯静态 | 无框架 | public / 根目录 | 直接 root |
| SSR | Next.js / Nuxt | .next / .output | 反向代理到 Node 进程（不由 Nginx 直接托管） |

> SSR 项目（Next.js / Nuxt）不应只配置静态托管；本 skill 提示「SSR 需要 Node 进程，建议用 deploy-native-skill 起 Node + Nginx 反代」。

## Phase 2: 检测 Nginx 是否安装

```bash
nginx -v 2>&1           # nginx version: nginx/1.24.0
echo $NGINX_CONF        # 用户自定义配置路径（可选）
```

默认配置路径：

| OS | 配置根目录 | 站点配置目录 |
|----|-----------|-------------|
| Ubuntu/Debian | `/etc/nginx/` | `/etc/nginx/sites-available/` + `sites-enabled/` |
| CentOS/RHEL | `/etc/nginx/` | `/etc/nginx/conf.d/` |
| Alpine | `/etc/nginx/` | `/etc/nginx/http.d/` |
| macOS (brew) | `/opt/homebrew/etc/nginx/` 或 `/usr/local/etc/nginx/` | `servers/` |
| Windows | `C:\nginx\conf\` | `nginx.conf` 内 `server {}` 块 |

## Phase 3: 生成 Nginx 安装命令（如缺失）

按 `server-setup-skill/references/install-commands.md` 中 Nginx 段生成幂等安装命令。如已安装，跳过。

## Phase 4: 生成站点配置

按 `references/nginx-config-spec.md` 输出配置骨架。核心片段：

### 4.1 SPA（Vue / React / Angular / Svelte）

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/myapp/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 4.2 纯静态

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/myapp/public;
    index index.html;
}
```

### 4.3 反向代理到后端 API

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:8080/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### 4.4 HTTPS（可选）

```nginx
listen 443 ssl http2;
ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
```

> HTTPS 证书建议用 certbot 获取；本 skill 生成命令，不自动申请。

## Phase 5: 部署步骤

生成如下步骤清单（脚本由 `deploy-native-skill` 整合）：

1. 拷贝构建产物到 `/var/www/<app>/`（或用户指定目录）。
2. 写入站点配置到对应目录。
3. `nginx -t` 校验配置语法。
4. `nginx -s reload`（或 `systemctl reload nginx`）重载。
5. 健康检查：`curl -I http://localhost/` 期望 200。

## Output

- 站点配置文件路径与内容。
- 拷贝产物的目标目录。
- 重载与健康检查命令。
- 如启用 HTTPS，输出 certbot 命令供用户手动执行。

## Resources

- `references/nginx-config-spec.md` — SPA / 纯静态 / 反代 / HTTPS 配置骨架与 Linux/Windows 路径差异

## Best Practices

- 先 `nginx -t` 再 `reload`，避免配置错误导致服务中断。
- SPA 必须配置 `try_files`，否则刷新路由 404。
- 静态资源长缓存（`/assets/` 加 hash 文件名可 `expires 1y`），HTML 不缓存。
- 反向代理必须传 `X-Forwarded-*` 头，后端才能拿到真实客户端 IP。
- HTTPS 不自动申请证书，输出 certbot 命令由用户执行。
- SSR 项目不要只托管静态，提示用 Node 进程 + 反代。
