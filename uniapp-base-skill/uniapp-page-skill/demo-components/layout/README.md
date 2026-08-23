# 布局与导航案例集

> 展示 `uniapp-base-skill` 在底部导航层与登录入口的能力：自定义 TabBar、登录页。

## 案例总览

### 自定义 TabBar（5 种风格）

| 案例 | 风格 | 适用场景 | HTML | 文档 |
|------|------|----------|------|------|
| bulge | 中间凸起 + 主色发布按钮 | 社区首页、内容平台 | [tabbar/html/bulge.html](tabbar/html/bulge.html) | [tabbar/bulge.md](tabbar/bulge.md) |
| blur | 毛玻璃背景 + 圆角顶部 | 高端音乐/生活类 App | [tabbar/html/blur.html](tabbar/html/blur.html) | [tabbar/blur.md](tabbar/blur.md) |
| standard | 标准图标 + 文字 + 顶部细线 | 通用型 App | [tabbar/html/standard.html](tabbar/html/standard.html) | [tabbar/standard.md](tabbar/standard.md) |
| floating-pill | 悬浮药丸 + 毛玻璃 + 圆角 | 健康、生活、工具类 App | [tabbar/html/floating-pill.html](tabbar/html/floating-pill.html) | [tabbar/floating-pill.md](tabbar/floating-pill.md) |
| assistant-split | 左侧独立 AI 助手 + 右侧连体工具组 | AI 助手、健康管理类 App | [tabbar/html/assistant-split.html](tabbar/html/assistant-split.html) | [tabbar/assistant-split.md](tabbar/assistant-split.md) |

### 登录页（7 种风格）

| 案例 | 风格 | 适用场景 | HTML | 文档 |
|------|------|----------|------|------|
| login | 标准账号登录：Logo + 账号密码 + 登录按钮 + 第三方登录 | 通用 App | [login/html/login.html](login/html/login.html) | [login/login.md](login/login.md) |
| login-phone | 手机号 + 验证码登录 | 手机号优先的 App | [login/html/login-phone.html](login/html/login-phone.html) | [login/login-phone.md](login/login-phone.md) |
| login-wechat | 一键登录风格：Logo + 微信一键登录按钮 + 协议 | 微信生态 App | [login/html/login-wechat.html](login/html/login-wechat.html) | [login/login-wechat.md](login/login-wechat.md) |
| login-minimal | 极简清爽：无圆角/小圆角、头部 Logo、下划线输入框 | 工具类、B端 App | [login/html/login-minimal.html](login/html/login-minimal.html) | [login/login-minimal.md](login/login-minimal.md) |
| login-gradient | 动态渐变背景 + 毛玻璃登录卡片 + 浮动光晕 | 创意、社交、年轻化 App | [login/html/login-gradient.html](login/html/login-gradient.html) | [login/login-gradient.md](login/login-gradient.md) |
| login-hero | 顶部主题图 + Logo + 缓慢缩放动效 + 简洁表单 | 旅游、生活方式 App | [login/html/login-hero.html](login/html/login-hero.html) | [login/login-hero.md](login/login-hero.md) |
| login-float | 深色背景 + 浮动圆形渐变 + 毛玻璃 Logo + 清爽登录卡片 | 社交、内容、社区类 App | [login/html/login-float.html](login/html/login-float.html) | [login/login-float.md](login/login-float.md) |

## 核心理念

所有布局案例都基于 `base-card` 的组合思想：

- **TabBar 也是卡片**：控制 `position`、`backdrop-filter`、`border-radius`
- **登录页也是卡片组合**：Logo 区、输入卡片、按钮卡片、协议文字

## 统一规范

1. 所有颜色使用主题变量，禁止写死
2. 图标使用 lucide SVG，禁止 emoji
3. 图片使用真实占位图，禁止空白占位
4. 安全区使用 `env(safe-area-inset-bottom)`
5. 每个 demo 均为完整页面形式，可直接在浏览器预览

## 文件结构

```
demo-components/layout/
├── README.md
├── tabbar/                 # 自定义 TabBar（5种）
│   ├── html/               # HTML 演示
│   │   ├── bulge.html
│   │   ├── blur.html
│   │   ├── standard.html
│   │   ├── floating-pill.html
│   │   └── assistant-split.html
└── login/                  # 登录页（7种）
    ├── html/               # HTML 演示
    │   ├── login.html
    │   ├── login-phone.html
    │   ├── login-wechat.html
    │   ├── login-minimal.html
    │   ├── login-gradient.html
    │   ├── login-hero.html
    │   └── login-float.html
```

> 综合页面模板（商城风格、个性化风格）已迁移至 [docs/uniapp-base-skill-demo/page-template](../../docs/uniapp-base-skill-demo/page-template/)，作为后续专题迭代素材。

---

> ⚠️ Demo 案例仅供参考，非完美实现
