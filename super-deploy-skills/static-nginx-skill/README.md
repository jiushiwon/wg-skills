# static-nginx-skill

一个用于 **前端静态产物与 Nginx 部署** 的 Claude Skill。读取 `deploy-profile.md` 判断前端产物类型，检测 Nginx 是否安装，生成 SPA / 纯静态 / 反向代理 / HTTPS 的站点配置。

---

## 它能做什么

当你说：

- 「静态文件部署」
- 「nginx 部署」
- 「vue 部署」
- 「react 部署」
- 「前端部署到服务器」

这个 Skill 会帮你把 Vue / React / Angular / Svelte 等前端构建产物托管到 Nginx，生成正确的站点配置（含 SPA 路由 fallback、API 反向代理、可选 HTTPS）。

---

## 它解决了什么问题

| 问题 | 解决方案 |
|------|----------|
| SPA 刷新路由 404 | 自动配置 `try_files $uri /index.html` |
| 不同 OS 的 Nginx 配置路径不同 | 按 OS 选择 sites-available / conf.d / http.d / nginx.conf |
| 后端 API 与前端同源跨域 | 生成 `location /api proxy_pass` 反代片段 |
| 静态资源缓存策略混乱 | 区分 HTML（不缓存）与带 hash 的 assets（长缓存） |
| HTTPS 证书配置繁琐 | 生成 certbot 命令供手动执行 |

---

## 支持的静态类型

| 类型 | 框架 | 产物目录 | 部署策略 |
|------|------|----------|----------|
| SPA | Vue / React / Angular / Svelte | dist / build | Nginx 托管 + history fallback |
| 纯静态 | 无框架 | public / 根目录 | Nginx 直接 root |
| SSR | Next.js / Nuxt | .next / .output | Node 进程 + Nginx 反代（不由本 skill 单独托管） |

---

## 使用方式

```
nginx 部署
```

或自然语言：

```
帮我把这个 Vue 项目部署到 Nginx
配置 React 项目的 Nginx 站点
```

### 五阶段流程

```
Phase 1: 读 deploy-profile.md，判断前端产物类型
Phase 2: 检测 Nginx 是否安装
Phase 3: 缺失则生成安装命令
Phase 4: 生成站点配置（SPA / 纯静态 / 反代 / HTTPS）
Phase 5: 输出部署步骤（拷贝产物 → 校验 → 重载 → 健康检查）
```

---

## 生成的配置示例（SPA）

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/myapp/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

---

## 目录结构

```
static-nginx-skill/
├── SKILL.md                         # 技能定义：触发条件、五阶段流程
├── README.md                        # 本文件
└── references/
    └── nginx-config-spec.md         # SPA / 纯静态 / 反代 / HTTPS 配置骨架
```

---

## 与上游/下游 Skill 的关系

- 上游：[deploy-detect-skill](../deploy-detect-skill/) 提供前端产物信息。
- 协作：[deploy-native-skill](../deploy-native-skill/) 负责构建与拷贝脚本；本 skill 负责 Nginx 配置。
- 协作：[server-setup-skill](../server-setup-skill/) 负责 Nginx 安装。

---

## 注意事项

1. **SSR 项目**：Next.js / Nuxt 需要 Node 进程，不能只托管静态，本 skill 会提示改用反代。
2. **校验后重载**：必须 `nginx -t` 通过再 `reload`。
3. **SPA 路由**：`try_files` 是必需项，否则刷新 404。
4. **HTTPS**：生成 certbot 命令，不自动申请证书。
5. **缓存策略**：HTML 不缓存，带 hash 的 assets 长缓存。
