# e2e 测试

5 个 puppeteer-core + Edge 真实浏览器测试。

## 前置条件

- 后端 `localhost:8080` 启动
- 前端 `localhost:5173` 启动
- Edge 浏览器路径 `C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe`

## 跑测试

```bash
# 1. 登录闭环 + API 抓包
node test-browser.mjs

# 2. 6 大业务页面访问 + 列表渲染
node test-crud.mjs

# 3. 菜单 SVG icon 渲染（4/4 + 0 warn）
node test-menu-icons.mjs

# 4. 真实 CRUD 端到端（POST/GET/DELETE 角色）
node test-real-crud.mjs

# 5. 6 大页面截图（存 D:/tmp/audit-YYYY-MM-DD-screenshots/）
node test-screenshots.mjs
```

## 注意事项

- **中文 payload 编码**：curl 测试中文 body 必须显式 `Content-Type: application/json; charset=utf-8`，Windows Git Bash 编码会导致 BodyParser JSON→UTF-8 解析错误
- **puppeteer-core + Edge**：必须用 Edge 而非 Chrome（Windows 默认有 Edge）
- **不要 commit D:/tmp 截图**：截图不入 git
- **不要进 CI**：这些脚本是 dogfooding 验证用，CI 跑太重