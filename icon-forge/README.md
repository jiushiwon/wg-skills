# icon-forge 🎨

> 配置驱动的 **SVG path → PNG** 图标批量生成技能。说清「要哪些图标、什么颜色、放哪」，AI 自动生成，无需手改脚本。

## 这是什么

`icon-forge` 是一个 [Claude Code / Agent Skill](https://docs.claude.com)。它把「维护一份图标配置 → 一键批量渲染 PNG」这件事固化成技能：

- 你只需用自然语言描述需求（图标语义、主题色、输出目录）；
- AI 按 heroicons / feather 语义补全 SVG path，写好 JSON 配置；
- 调用内置的 `forge-icons.js`（基于 [sharp](https://sharp.pixelplumbing.com/)）批量渲染成 PNG。

适合 **uniapp / 小程序 / React Native / H5** 等需要成套单色 PNG 图标的场景，避免手动导出、命名混乱、尺寸不一致。

## 解决的痛点

| 以前 | 现在 |
|------|------|
| 每次复制一份生成脚本，改里面的常量（路径、颜色、图标数组） | 一句话描述，AI 写配置并运行 |
| 路径写死在脚本里，换项目就得改 | 配置里传 `outDir`，技能与脚本路径无关 |
| 要自己找/画 SVG path | AI 按语义给出常用 heroicons path |

## 安装

技能采用「仓库存源 + 本地软链接」方式（与 `frontend-ui-foundry` 一致），便于公开仓库管理：

```bash
# 1. 克隆本仓库后，建立软链接到个人技能目录
ln -s /绝对路径/wg-skills/icon-forge ~/.claude/skills/icon-forge

# 2. 安装依赖（仅首次，装 sharp）
cd ~/.claude/skills/icon-forge && npm install
```

> Windows 下软链接：以管理员身份 `mklink /D "%USERPROFILE%\.claude\skills\icon-forge" "D:\绝对路径\wg-skills\icon-forge"`，或在 Git Bash 中用上面的 `ln -s`。

## 使用

安装后，直接对 AI 说需求即可触发技能，例如：

> 「给登录页生成一套图标，绿色 `#059669`，放 `src/static/icons/login`，要数据、看板、洞察、计划、记录、重测」

AI 会生成类似配置并运行：

```json
{
  "outDir": ".../src/static/icons/login",
  "size": 72,
  "color": "#059669",
  "icons": [
    { "name": "feature-data.png", "path": "M9 12h6m-6 4h6..." },
    { "name": "feature-dashboard.png", "path": "M9 19v-6a2 2 0 00-2-2..." }
  ]
}
```

### 也可手动调用脚本

```bash
cd ~/.claude/skills/icon-forge
echo '{"outDir":"./out","size":48,"color":"#059669","icons":[{"name":"a.png","path":"M9 12h6"}]}' | node forge-icons.js -
# 或
node forge-icons.js spec.json
```

## 配置字段

| 字段 | 必填 | 默认 | 说明 |
|------|------|------|------|
| `outDir` | ✅ | — | 输出目录，自动创建 |
| `size` | | `72` | 输出像素（正方形） |
| `color` | | `#059669` | 描边色 |
| `strokeWidth` | | `2` | 描边宽度 |
| `icons[].name` | ✅ | — | 输出文件名（含 `.png`） |
| `icons[].path` | ※ | — | heroicons/feather 风格 path（viewBox `0 0 24 24`） |
| `icons[].svg` | ※ | — | 完整 SVG 字符串 |

※ `path` 与 `svg` 二选一。

## 文件结构

```
icon-forge/
├── SKILL.md        # 技能定义（AI 读取，含工作流与常用 path 速查）
├── forge-icons.js  # 生成器（Node + sharp）
├── package.json    # 依赖声明（sharp）
└── README.md       # 本文件
```

## 常见问题

**Q: 图标有白边或模糊？** SVG 用标准 `viewBox="0 0 24 24"`，输出尺寸用标准值（48 / 72 / 81）。

**Q: 想要彩色 / 多色图标？** 用 `svg` 字段传完整 SVG，自带 `fill`/`stroke` 即可，`color` 字段只对 `path` 模式生效。

**Q: 换电脑后失效？** 重新建软链接 + `npm install`（见「安装」）。

## License

MIT
