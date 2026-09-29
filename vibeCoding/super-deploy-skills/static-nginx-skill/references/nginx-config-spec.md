# Nginx 配置规范

本文件定义 `static-nginx-skill` 生成 Nginx 站点配置的骨架，覆盖 SPA、纯静态、反向代理、HTTPS 四种场景，并说明 Linux / Windows 路径差异。

## 配置路径约定

| OS | 站点配置目录 | 启用方式 |
|----|-------------|----------|
| Ubuntu/Debian | `/etc/nginx/sites-available/<app>.conf` | `ln -s` 到 `sites-enabled/` |
| CentOS/RHEL | `/etc/nginx/conf.d/<app>.conf` | 自动加载 `*.conf` |
| Alpine | `/etc/nginx/http.d/<app>.conf` | 自动加载 |
| macOS (brew) | `/opt/homebrew/etc/nginx/servers/<app>.conf` 或 `/usr/local/etc/nginx/servers/` | 自动加载 |
| Windows | `C:\nginx\conf\nginx.conf` 内 `server {}` 块 | 直接编辑主配置 |

## 产物目录约定

建议统一放到 `/var/www/<app>/`（Linux）或 `C:\www\<app>\`（Windows），便于权限管理：

```bash
sudo mkdir -p /var/www/myapp
sudo cp -r dist/* /var/www/myapp/
sudo chown -R www-data:www-data /var/www/myapp   # Ubuntu/Debian
# CentOS/RHEL: sudo chown -R nginx:nginx /var/www/myapp
```

## SPA 配置骨架（Vue / React / Angular / Svelte）

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/myapp/dist;
    index index.html;

    # 静态资源长缓存（带 hash 文件名）
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # SPA 路由 fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 禁止缓存 HTML，保证发版后立即生效
    location = /index.html {
        add_header Cache-Control "no-store";
    }
}
```

## 纯静态配置骨架

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/myapp/public;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

## 反向代理到后端 API

适用于前后端同域，前端 `/api/*` 转发到后端服务。后端端口来自环境变量 `APP_PORT`（默认 8080，与 `script-standards.md` 一致）。

> Nginx 配置本身不读环境变量。生成站点配置时由本 skill 把 `APP_PORT` 替换为实际端口；或运行时用 `envsubst '${APP_PORT}' < /etc/nginx/templates/app.conf.template > /etc/nginx/conf.d/app.conf` 渲染。两种方案二选一。

```nginx
location /api/ {
    # ${APP_PORT} 在生成配置时替换为实际端口（默认 8080）
    proxy_pass http://127.0.0.1:${APP_PORT}/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

> `proxy_pass` 末尾的 `/` 决定是否在转发时去掉 `/api` 前缀。末尾带 `/`：`/api/users` → 后端收到 `/users`；末尾不带 `/`：后端收到 `/api/users`。按后端实际路由选择。

## HTTPS 配置骨架

```nginx
server {
    listen 443 ssl http2;
    server_name example.com;
    root /var/www/myapp/dist;
    index index.html;

    ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

# HTTP 跳转 HTTPS
server {
    listen 80;
    server_name example.com;
    return 301 https://$host$request_uri;
}
```

证书申请（生成命令，不自动执行）：

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d example.com
```

## 校验与重载

```bash
sudo nginx -t            # 校验配置语法
sudo nginx -s reload     # 平滑重载（CentOS/RHEL: sudo systemctl reload nginx）
```

Windows：

```powershell
C:\nginx\nginx.exe -t
C:\nginx\nginx.exe -s reload
```

## 健康检查

```bash
curl -I http://localhost/         # 期望 HTTP/1.1 200 OK
curl -I https://example.com/      # 启用 HTTPS 后
```

## 常见坑

- **刷新 404**：SPA 缺 `try_files $uri /index.html`。
- **API 跨域**：未配置 `/api` 反代，前端直接请求后端端口导致 CORS。
- **缓存导致发版不生效**：HTML 必须 `no-store`，assets 用 hash 文件名才可长缓存。
- **权限拒绝**：产物目录 owner 不是 `www-data`/`nginx`，Nginx 读不到文件。
- **后端拿不到真实 IP**：缺 `X-Forwarded-For` / `X-Real-IP` 头。
